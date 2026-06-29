#input_type_name: FetchOutlookMessageInput
#output_type_name: FetchOutlookMessageResult
#function_name: fetch_outlook_message

from pydantic import BaseModel
from typing import Optional, List
from lemma_sdk import FunctionContext, Pod
import json

class FetchOutlookMessageInput(BaseModel):
    message_id: str

class FetchOutlookMessageResult(BaseModel):
    email_body: str
    sender_address: str
    attachment_path: Optional[str]

def fetch_outlook_message(ctx: FunctionContext, data: FetchOutlookMessageInput) -> FetchOutlookMessageResult:
    pod = Pod.from_env()
    
    # 0. Early deduplication lock: Try to create the deal immediately.
    # If two workflows run at the exact same millisecond, only ONE will succeed in creating this row.
    import hashlib
    deal_id = hashlib.md5(data.message_id.encode()).hexdigest()
    try:
        pod.table("deals").create({
            "id": deal_id,
            "company_name": "Processing incoming email...",
            "pipeline_stage": "Screening",
            "status": "Pending",
            "sector": "Other"
        })
    except Exception as e:
        # If create fails (e.g., Primary Key already exists), abort this run!
        raise Exception(f"Duplicate message detected for {data.message_id}, aborting. Details: {str(e)}")

    # 1. Get the email message details
    # We use "outlook" connector assuming the provider is COMPOSIO and auth config is "outlook"
    try:
        msg_resp = pod.connectors.execute(
            "outlook",
            "OUTLOOK_GET_MESSAGE",
            {
                "message_id": data.message_id,
                "user_id": "me",
                "select": ["body", "sender", "hasAttachments", "subject"]
            }
        )
    except Exception as e:
        print(f"Error fetching message: {e}")
        return FetchOutlookMessageResult(email_body="Error fetching email", sender_address="unknown", attachment_path=None)

    msg_data = msg_resp.to_dict().get("result", {})
    if not isinstance(msg_data, dict):
        msg_data = getattr(msg_resp, 'data', {}) or msg_data
    
    # Extract data from the Composio response
    if "data" in msg_data and isinstance(msg_data["data"], dict):
        email_info = msg_data["data"]
    else:
        email_info = msg_data
        
    email_body = ""
    sender_address = "unknown"
    
    if "body" in email_info and isinstance(email_info["body"], dict):
        email_body = email_info["body"].get("content", "")
    elif "body" in email_info:
        email_body = str(email_info["body"])
        
    if "sender" in email_info and isinstance(email_info["sender"], dict):
        email_addr = email_info["sender"].get("emailAddress", {})
        sender_address = email_addr.get("address", "unknown")
    
    attachment_path = None
    
    # 2. Get the attachments
    # if email_info.get("hasAttachments"):
    try:
        # First list attachments to find the ID
        list_resp = pod.connectors.execute(
            "outlook",
            "OUTLOOK_LIST_OUTLOOK_ATTACHMENTS",
            {
                "message_id": data.message_id,
                "user_id": "me"
            }
        )
        
        list_data = list_resp.to_dict().get("result", {})
        if not isinstance(list_data, dict):
            list_data = getattr(list_resp, 'data', {}) or list_data
            
        attachments_list = []
        if "data" in list_data and isinstance(list_data["data"], dict) and "value" in list_data["data"]:
            attachments_list = list_data["data"]["value"]
        elif "value" in list_data:
            attachments_list = list_data["value"]
        elif isinstance(list_data.get("data"), list):
            attachments_list = list_data["data"]
            
        # Find the first PDF or PPT
        target_att = None
        for att in attachments_list:
            name = att.get("name", "").lower()
            if name.endswith(".pdf") or name.endswith(".ppt") or name.endswith(".pptx"):
                target_att = att
                break
                
        if target_att:
            att_id = target_att.get("id")
            name = target_att.get("name")
            
            # Now download the attachment content
            att_resp = pod.connectors.execute(
                "outlook",
                "OUTLOOK_GET_USER_MESSAGES_ATTACHMENTS",
                {
                    "message_id": data.message_id,
                    "attachment_id": att_id,
                    "user_id": "me",
                    "mail_folder_id": "inbox"
                }
            )
            
            att_data = att_resp.to_dict().get("result", {})
            if not isinstance(att_data, dict):
                att_data = getattr(att_resp, 'data', {}) or att_data
                
            att_content_info = {}
            if "data" in att_data and isinstance(att_data["data"], dict):
                att_content_info = att_data["data"]
            else:
                att_content_info = att_data
                
            content_bytes_b64 = att_content_info.get("contentBytes")
            if content_bytes_b64:
                import base64
                file_bytes = base64.b64decode(content_bytes_b64)
                
                import os
                import uuid
                unique_id = str(uuid.uuid4())[:8]
                base, ext = os.path.splitext(name)
                unique_name = f"{base}_{unique_id}{ext}"
                tmp_path = f"/tmp/{unique_name}"
                with open(tmp_path, "wb") as f:
                    f.write(file_bytes)
                
                # Determine folder based on extension
                if name.lower().endswith(".pdf"):
                    dest_folder = "/decks/pdf"
                else:
                    dest_folder = "/decks/ppt"
                    
                attachment_path = f"{dest_folder}/{unique_name}"
                
                # Upload to pod
                file_metadata = pod.files.upload(tmp_path, directory_path=dest_folder)
                print(f"Uploaded attachment to {attachment_path}")
                
                # Removed indexing polling to speed up UI. Polling will be handled downstream if needed.
                
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)

    except Exception as e:
        print(f"Error fetching attachments: {e}")

    return FetchOutlookMessageResult(
        email_body=email_body,
        sender_address=sender_address,
        attachment_path=attachment_path
    )
