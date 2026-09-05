# 🧾 ParchiPilot
**The Agentic AI Finance Controller — Autonomous Phantom Vendor & Invoice Audit Pipeline**

[![Razorpay AI Buildathon 2026](https://img.shields.io/badge/Razorpay_AI_Buildathon-Track_04-blue.svg)](#)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](#)
[![Django](https://img.shields.io/badge/django-5.0+-green.svg)](#)
[![React](https://img.shields.io/badge/react-18.x-61dafb.svg)](#)

B2B invoice fraud and "phantom vendor" scams cost enterprises millions annually. **ParchiPilot** is an autonomous AI finance controller built for **Track 04: AI Finance Controller**. 

Rather than just wrapping an LLM to generate text, ParchiPilot utilizes a strict, multi-step **LangGraph state machine** to ingest messy invoices, extract structured data via **Gemini 1.5 Flash**, validate tax IDs against external registries, and analyze historical spending anomalies—all before a human ever has to look at the ledger.

---

## 🎯 Why This Meets the Razorpay Rubric

*   **Verification Capacity (Not Generation):** ParchiPilot doesn't write emails; it audits data. It deterministically outputs a boolean `is_approved` status alongside a strict JSON schema.
*   **Immutable Audit Trails:** Every step of the agent's reasoning—from OCR extraction to registry validation—is saved in a PostgreSQL/SQLite database for compliance review.
*   **Bounded Actions & Graceful Failure:** If an invoice is illegible, or if the extracted GST number fails the registry ping, the LangGraph agent immediately short-circuits the LLM reasoning phase and safely routes the document to a `MANUAL_REVIEW` queue.

---

## 🏗️ Architecture & Tech Stack

*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
*   **Backend API:** Django, Django REST Framework (DRF), SQLite / PostgreSQL.
*   **Agentic Orchestration:** LangGraph (State Graph pipeline with conditional validation).
*   **AI / LLM Layer:** Google Gemini (via `langchain-google-genai`), supporting `gemini-3.5-flash` / `gemini-1.5-flash`.
*   **Document Ingestion:** `pdfplumber` (in-memory multi-format PDF & image rendering).

### The Agentic Loop
1. **Ingest:** Accept commercial invoice (PDF or image) and render high-resolution raster bytes.
2. **Extract:** Gemini multimodal model extracts vendor, bill number, amounts, line items, and tax identifiers.
3. **Validate:** LangGraph validation node checks mathematical subtotal accuracy, tax ID format, and queries the database for duplicate invoice collisions.
4. **Persist:** Django records the verified document, status (`CLEAN`, `REVIEW`, `FLAGGED`), confidence score, and immutable `AgentStep` telemetry.
5. **Resolve:** Financial controllers review anomalies, approving, rejecting, or escalating invoices with full audit trail logging.

---

## 🚀 Local Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/dhairyaya/parchipilot.git
cd parchipilot
```

### 2. Backend Setup (Django + LangGraph)
```bash
cd backend

# Create & activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Open .env and add your Google Gemini API key:
# GOOGLE_API_KEY=your_gemini_api_key_here

# Run database migrations & start development server
python manage.py migrate
python manage.py runserver 8000
```
The Django API will be live at `http://127.0.0.1:8000/`.

### 3. Frontend Setup (React 19 + Vite)
```bash
# In a separate terminal tab:
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server with API proxy
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser to launch the ParchiPilot Auditor Dashboard.