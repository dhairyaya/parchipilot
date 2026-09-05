from langgraph.graph import StateGraph, START, END
from .state import InvoiceState
from .extract import extract_invoice_node
from .validate import validate_invoice_node

workflow = StateGraph(InvoiceState)

workflow.add_node("extract", extract_invoice_node)
workflow.add_node("validate", validate_invoice_node)
workflow.add_edge(START, "extract")
workflow.add_edge("extract","validate")
workflow.add_edge("validate", END) 

app = workflow.compile()