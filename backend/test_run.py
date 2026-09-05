"""
End-to-end verification script for the ParchiPilot LangGraph pipeline.
Usage: python test_run.py
"""
import sys
import logging
import os
import django
from dotenv import load_dotenv

load_dotenv()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(levelname)s] %(message)s")
logger = logging.getLogger("auditor.test_run")

try:
    from auditor.agents.graph import app

except ImportError as e:
    logger.error("Import Error: %s", e)
    sys.exit(1)


def main():
    initial_state = {
        "image_path": "test_images/sample_invoice_demo.png",
        "extracted_data": {},
        "is_valid": True,
        "validation_errors": [],
    }

    logger.info("Executing LangGraph audit pipeline for: %s", initial_state['image_path'])

    try:
        final_state = app.invoke(initial_state)

        logger.info("Pipeline execution finished.")
        print("\n--- Extracted Invoice Metadata ---")
        for key, value in final_state.get("extracted_data", {}).items():
            print(f"  {key}: {value}")

        is_valid = final_state.get("is_valid")
        print(f"\n--- Validation Status: {'PASSED' if is_valid else 'FLAGGED'} ---")
        if is_valid:
            print("  Invoice passed all statutory format and ledger duplicate checks.")
        else:
            print("  Flagged Anomaly Items:")
            for err in final_state.get("validation_errors", []):
                print(f"    - {err}")

    except Exception as e:
        logger.error("Pipeline execution failed: %s", e)
        print("\nNote: Verify that your GOOGLE_API_KEY is properly set in backend/.env")


if __name__ == "__main__":
    main()