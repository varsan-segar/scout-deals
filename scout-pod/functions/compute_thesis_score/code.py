#input_type_name: ThesisScoreInput
#output_type_name: ThesisScoreResult
#function_name: compute_thesis_score

from pydantic import BaseModel
from typing import Optional, List
from lemma_sdk import FunctionContext, Pod

import json

class ThesisScoreInput(BaseModel):
    deal_id: str

class ScoreBreakdown(BaseModel):
    stage_match: float
    sector_match: float
    founder_type: float
    geography: float
    revenue_stage: float

class ThesisScoreResult(BaseModel):
    total_score: float
    breakdown: ScoreBreakdown
    summary: str

def compute_thesis_score(ctx: FunctionContext, data: ThesisScoreInput) -> ThesisScoreResult:
    pod = Pod.from_env()
    
    # 1. Fetch deal
    deal = pod.table("deals").get(data.deal_id)
    sector = deal.get("sector") or ""
    
    # 2. Fetch brief
    briefs = pod.records.list("briefs", filter=[{"field": "deal_id", "op": "eq", "value": data.deal_id}]).to_dict()["items"]
    if not briefs:
        raise ValueError(f"No brief found for deal {data.deal_id}")
    brief = briefs[0]
    
    # parse snapshot
    snapshot_json = brief.get("snapshot_json") or "{}"
    snapshot = json.loads(snapshot_json)
    stage = (snapshot.get("company_stage") or "unknown").lower()
    is_pre_revenue = snapshot.get("is_pre_revenue")
    if is_pre_revenue is None:
        is_pre_revenue = True
    
    # 3. Fetch thesis config
    thesis_configs = pod.records.list("thesis_config").to_dict()["items"]
    thesis = thesis_configs[0] if thesis_configs else {}
    
    scores = {}

    # Parse preferred stages
    stages_val = thesis.get("preferred_stages", "")
    if isinstance(stages_val, str):
        preferred = [s.strip().lower() for s in stages_val.split(",") if s.strip()]
    elif isinstance(stages_val, list):
        preferred = [str(s).lower() for s in stages_val]
    else:
        preferred = []

    if not preferred or "any" in preferred or "all" in preferred:
        scores["stage_match"] = 2.0
    elif any(p in stage for p in preferred):
        scores["stage_match"] = 2.0
    else:
        scores["stage_match"] = 0.0

    # Parse preferred sectors
    sectors_val = thesis.get("preferred_sectors", "")
    if isinstance(sectors_val, str):
        preferred_sectors = [s.strip().lower() for s in sectors_val.split(",") if s.strip()]
    elif isinstance(sectors_val, list):
        preferred_sectors = [str(s).lower() for s in sectors_val]
    else:
        preferred_sectors = []
        
    sector_lower = sector.lower()
    if not preferred_sectors or "any" in preferred_sectors or "all" in preferred_sectors:
        scores["sector_match"] = 2.0
    elif sector_lower in preferred_sectors:
        scores["sector_match"] = 2.0
    elif any(s in sector_lower for s in preferred_sectors):
        scores["sector_match"] = 1.0
    else:
        scores["sector_match"] = 0.0

    # Geography (0-2) - default to India-based for MVP
    scores["geography"] = 2.0

    # Revenue stage (0-2)
    pre_revenue_ok = thesis.get("pre_revenue_ok", True)
    if is_pre_revenue and pre_revenue_ok:
        scores["revenue_stage"] = 2.0
    elif not is_pre_revenue:
        scores["revenue_stage"] = 2.0
    else:
        scores["revenue_stage"] = 0.0

    # Founder type (0-2) - dynamic based on brief-synthesiser founders_json
    founder_score = 1.0
    founders_json_str = brief.get("founders_json", "[]")
    try:
        if founders_json_str:
            founders = json.loads(founders_json_str)
            if not founders:
                founder_score = 0.0
            else:
                strong_keywords = ["ex-google", "ex-meta", "ex-apple", "ex-amazon", "ex-netflix", "stanford", "mit", "harvard", "serial", "repeat founder", "y combinator", "yc", "openai", "deepmind", "anthropic", "iit", "iim", "bits", "isb", "ex-flipkart", "ex-oyo", "ex-zomato", "ex-phonepe", "ex-payu", "ex-razorpay"]
                for f in founders:
                    bg = (f.get("background_summary", "") + " " + " ".join(f.get("previous_companies", [])) + " " + f.get("education", "")).lower()
                    if any(kw in bg for kw in strong_keywords):
                        founder_score = 2.0
                        break
    except Exception as e:
        print(f"Error parsing founders_json: {e}")
        
    scores["founder_type"] = founder_score

    total = round(sum(scores.values()), 1)

    breakdown = ScoreBreakdown(
        stage_match=scores["stage_match"],
        sector_match=scores["sector_match"],
        founder_type=scores["founder_type"],
        geography=scores["geography"],
        revenue_stage=scores["revenue_stage"]
    )

    # Generate summary
    parts = []
    if scores["stage_match"] == 2.0:
        parts.append(f"Stage ({stage}) matches thesis.")
    else:
        parts.append(f"Stage ({stage}) does not match preferred stages.")
    if scores["sector_match"] == 2.0:
        parts.append(f"Sector ({sector}) is a direct match.")
    elif scores["sector_match"] == 1.0:
        parts.append(f"Sector ({sector}) is a partial match.")
    else:
        parts.append(f"Sector ({sector}) is outside thesis focus.")

    summary = " ".join(parts)

    res = ThesisScoreResult(
        total_score=total,
        breakdown=breakdown,
        summary=summary
    )
    
    # 4. Update the datastore
    pod.table("briefs").update(brief["id"], {
        "thesis_breakdown_json": res.model_dump_json() if hasattr(res, 'model_dump_json') else res.json()
    })
    
    pod.table("deals").update(data.deal_id, {
        "thesis_match_score": total,
        "status": "Ready"
    })
    
    return res
