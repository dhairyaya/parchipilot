from typing import TypedDict, List, Optional, Dict, Any

class InvoiceState(TypedDict, total=False):
    image_path: str
    invoice_id: Optional[int]
    extracted_data: dict
    is_valid: bool
    validation_errors: List[str]
    audit_checks: List[Dict[str, Any]]

