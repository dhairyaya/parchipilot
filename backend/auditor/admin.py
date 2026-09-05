from django.contrib import admin
from .models import Invoice, AgentStep, AuditTrail


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'vendor_name', 'total_amount', 'status', 'ai_confidence', 'uploaded_at')
    list_filter = ('status', 'uploaded_at')
    search_fields = ('invoice_number', 'vendor_name')
    readonly_fields = ('uploaded_at',)


@admin.register(AgentStep)
class AgentStepAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'step_name', 'status', 'created_at')
    list_filter = ('step_name', 'status', 'created_at')
    search_fields = ('invoice__invoice_number', 'invoice__vendor_name')


@admin.register(AuditTrail)
class AuditTrailAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'action_taken', 'timestamp')
    list_filter = ('action_taken', 'timestamp')
    search_fields = ('invoice__invoice_number', 'notes')
