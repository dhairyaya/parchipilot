from rest_framework import serializers
from .models import Invoice, AgentStep, AuditTrail

class AgentStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentStep
        fields = '__all__'

class AuditTrailSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditTrail
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    agent_steps = AgentStepSerializer(many=True, read_only=True)
    audit_trails = AuditTrailSerializer(many=True, read_only=True)
    
    class Meta:
        model = Invoice
        fields = '__all__'
