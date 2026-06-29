#input_type_name: SaveEmailDealInput
#output_type_name: SaveEmailDealResult
#function_name: save_email_deal

from pydantic import BaseModel
from typing import Optional
from lemma_sdk import FunctionContext, Pod
import uuid

class SaveEmailDealInput(BaseModel):
    company_name: str
    website_url: Optional[str] = None
    amount_raised: Optional[str] = None
    existing_investors: Optional[str] = None
    year_founded: Optional[int] = None
    revenue_model: Optional[str] = None
    email_body: Optional[str] = None
    deck_file_path: Optional[str] = None
    message_id: Optional[str] = None

class SaveEmailDealResult(BaseModel):
    deal_id: str

def save_email_deal(ctx: FunctionContext, data: SaveEmailDealInput) -> SaveEmailDealResult:
    pod = Pod.from_env()
    
    if data.message_id:
        import hashlib
        deal_id = hashlib.md5(data.message_id.encode()).hexdigest()
    else:
        deal_id = str(uuid.uuid4())
    
    # Defaults
    company_name = data.company_name or "Unknown Startup"
    
    pod.table("deals").update(deal_id, {
        "company_name": company_name,
        "website_url": data.website_url,
        "amount_raised": data.amount_raised,
        "existing_investors": data.existing_investors,
        "year_founded": data.year_founded,
        "revenue_model": data.revenue_model,
        "email_body": data.email_body,
        "deck_file_path": data.deck_file_path,
        "pipeline_stage": "Screening",
        "status": "Pending",
        "sector": "Other"
    })
    
    return SaveEmailDealResult(deal_id=deal_id)
