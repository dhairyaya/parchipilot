from dotenv import load_dotenv
load_dotenv()

import base64
import json
import mimetypes
import re
from io import BytesIO
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from .state import InvoiceState



def _pdf_first_page_to_png_bytes(pdf_path: str) -> bytes:
    """Render the first page of a PDF into PNG image bytes in-memory."""
    import pdfplumber
    with pdfplumber.open(pdf_path) as pdf:
        if not pdf.pages:
            raise ValueError("Uploaded PDF document contains no pages.")
        page = pdf.pages[0]
        pil_image = page.to_image(resolution=200).original
        buffer = BytesIO()
        pil_image.save(buffer, format="PNG")
        return buffer.getvalue()


def build_invoice_message(file_path: str, prompt: str) -> HumanMessage:
    mime_type, _ = mimetypes.guess_type(file_path)
    is_pdf = (mime_type == "application/pdf") or file_path.lower().endswith(".pdf")

    if is_pdf:
        image_bytes = _pdf_first_page_to_png_bytes(file_path)
        mime_type = "image/png"
    elif mime_type in {"image/jpeg", "image/png", "image/webp"}:
        with open(file_path, "rb") as f:
            image_bytes = f.read()
    else:
        # Graceful fallback: attempt opening with Pillow
        try:
            from PIL import Image
            with Image.open(file_path) as im:
                buffer = BytesIO()
                im.convert("RGB").save(buffer, format="PNG")
                image_bytes = buffer.getvalue()
                mime_type = "image/png"
        except Exception as exc:
            raise ValueError(f"Unsupported file format: {mime_type or 'unknown'}") from exc

    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    image_data_uri = f"data:{mime_type};base64,{image_base64}"

    return HumanMessage(
        content=[
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": image_data_uri}},
        ]
    )


# Model configuration: supports gemini-3.5-flash or environment override
import os

PRIMARY_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")
api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")

model = ChatGoogleGenerativeAI(
    model=PRIMARY_MODEL,
    temperature=0.1,
    google_api_key=api_key,
)


def extract_invoice(file_path: str, prompt: str):
    message = build_invoice_message(file_path, prompt)
    try:
        return model.invoke([message])
    except Exception as e:
        # If the specific model identifier is not available on this API tier, fallback gracefully
        err_msg = str(e).lower()
        if "not found" in err_msg or "404" in err_msg:
            fallback_model = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                temperature=0.1,
                google_api_key=api_key,
            )
            return fallback_model.invoke([message])
        raise




def extract_invoice_node(state: InvoiceState) -> dict:
    image_path = state["image_path"]
    prompt = (
        "You are an autonomous enterprise financial auditor. Ingest this invoice document and extract:\n"
        "- vendor_name: string (company or vendor name)\n"
        "- invoice_number: string (invoice/bill reference number)\n"
        "- date: string (YYYY-MM-DD format if identifiable, or null)\n"
        "- total_amount: number (numeric total bill amount as a float)\n"
        "- tax_id: string (GSTIN, VAT, or Tax ID, or null if absent)\n"
        "- category: string (procurement category, e.g., 'Cloud Infrastructure', 'Office Procurement', 'Freight & Logistics', 'Equipment')\n"
        "- line_items: array of objects with keys: label (string), qty (number), price (string or number)\n\n"
        "Return ONLY a clean valid JSON object without markdown formatting or conversational prose."
    )

    raw_response = extract_invoice(image_path, prompt)
    raw_content = raw_response.content

    if isinstance(raw_content, list):
        raw_text = "".join(
            [block.get("text", "") for block in raw_content if isinstance(block, dict) and "text" in block]
        )
    elif isinstance(raw_content, str):
        raw_text = raw_content
    else:
        raw_text = str(raw_content)

    # Extract JSON substring defensively
    match = re.search(r'\{.*\}', raw_text, re.DOTALL)
    if match:
        clean_text = match.group(0)
    else:
        clean_text = raw_text.replace("```json", "").replace("```", "").strip()

    if not clean_text:
        clean_text = "{}"

    try:
        extracted_data = json.loads(clean_text)
    except json.JSONDecodeError:
        extracted_data = {
            "vendor_name": "Unresolved Vendor",
            "invoice_number": "UNKNOWN",
            "date": None,
            "total_amount": 0.0,
            "error": "Failed to parse structured JSON from OCR response",
        }

    return {"extracted_data": extracted_data}

