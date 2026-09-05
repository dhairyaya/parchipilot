from django.db import models
class Invoice(models.Model):
    class StatusChoices(models.TextChoices):
        PROCESSING = 'PROCESSING', 'Processing'
        CLEAN = 'CLEAN', 'Clean'
        REVIEW = 'REVIEW', 'Needs Review'
        FLAGGED = 'FLAGGED', 'Flagged'
    
    file = models.FileField(upload_to='invoices/%Y/%m/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    vendor_name = models.CharField(max_length=255, blank=True, null=True)
    invoice_number = models.CharField(max_length=100, blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.PROCESSING)
    ai_confidence = models.FloatField(default=0.0)
    extracted_json = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.invoice_number or 'Draft'} | {self.vendor_name or 'Unknown'} [{self.status}]"
class AgentStep(models.Model):
    
    class StepChoices(models.TextChoices):
        EXTRACTION = 'EXTRACTION', 'Document Extraction'
        VALIDATION = 'VALIDATION', 'Tax ID Validation'
        REASONING = 'REASONING', 'Anomaly Analysis'
        DECISION = 'DECISION', 'Final Approval Decision'
    
    class StatusChoices(models.TextChoices):
        PENDING = 'PENDING', 'Waiting to run'
        SUCCESS = 'SUCCESS', 'Completed successfully'
        FAILED = 'FAILED', 'Failed (error)'
        FLAGGED = 'FLAGGED', 'Completed but raised flags'
    
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='agent_steps')
    step_name = models.CharField(max_length=20, choices=StepChoices.choices)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Invoice {self.invoice.invoice_number} | {self.step_name} | {self.status}"

class AuditTrail(models.Model):
    class ActionChoices(models.TextChoices):
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        ESCALATED = 'ESCALATED', 'Escalated'

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='audit_trails'
    )

    action_taken = models.CharField(
        max_length=20,
        choices=ActionChoices.choices
    )
    notes = models.TextField(blank=True, null=True)

    timestamp = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Invoice {self.invoice.invoice_number} | {self.action_taken} | {self.timestamp.strftime('%Y-%m-%d %H:%M')}"