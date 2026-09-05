from django.urls import path
from . import views


urlpatterns = [
    path('invoices/', views.list_invoices, name='list_invoices'),
    path('upload/', views.upload_invoice, name='upload_invoice'),
    path('invoices/<int:invoice_id>/resolve/', views.resolve_invoice, name='resolve_invoice'),
]