from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def upload_invoice(request):
    uploaded_file = request.FILES.get('file')

    if uploaded_file is None:
        return Response({'error': 'No file uploaded'}, status=400)

    print('✅ Upload received:', uploaded_file.name)

    mock_response = {
        "invoice": {
            "id": "INV-DJ-001",
            "vendorName": "Django Backend Systems",
            "date": "2026-08-30",
            "totalAmount": 95000,
            "currency": "INR"
        },
        "audit": {
            "status": "flagged",
            "anomalies": ["Connection to Django successful!"]
        }
    }
    
    return Response(mock_response)