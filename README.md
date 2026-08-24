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

*   **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui.
*   **Backend API:** Django, Django REST Framework (DRF), PostgreSQL (SQLite for local dev).
*   **Agentic Orchestration:** LangGraph (State Graph with conditional routing).
*   **AI / LLM Layer:** Google Gemini 1.5 Flash (via `langchain-google-genai`).
*   **Document Parsing:** `pdfplumber`, `pytesseract`.

### The Agentic Loop
1. **Ingest:** Accept PDF/Image and extract raw text.
2. **Extract:** LLM formats text into a strict Pydantic JSON schema.
3. **Validate:** Python function pings the (Mock) GST Registry API.
4. **Reason:** If verified, the LLM analyzes amounts against historical vendor data.
5. **Execute:** Django records the final verdict and reasoning into the `AgentAuditLog`.

---

## 🚀 Local Setup Instructions (Frictionless)

We designed this repository to run instantly on your local machine with zero paid API dependencies. 

### 1. Clone & Environment
```bash
git clone [https://github.com/dhairyaya/parchipilot.git](https://github.com/dhairyaya/parchipilot.git)
cd parchipilot