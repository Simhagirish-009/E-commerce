from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .models import *
from .form_serializers import *
import random
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.permissions import AllowAny,IsAuthenticated
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.decorators import api_view

# generating OTP code 
def generate_otp():
    return random.randint(100000, 999999)

# Function to send OTP email
def send_otp_email(email, otp):
    try:
        send_mail(
            'Your OTP for Login',
            f'Your OTP is: {otp}',
            'admin@myapp.com',
            [email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Error sending OTP email: {e}")

# Login view for email and password authentication
@api_view(['POST'])
def login(request):

    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user = serializer.validated_data['user']
    email = user.email
    try:
        customer = Customer.objects.get(user=user)
    except Customer.DoesNotExist:
        return Response({"error": "Customer profile not found."}, status=status.HTTP_404_NOT_FOUND)
    otp = generate_otp()

    Otp.objects.filter(user=user).delete()
    otp_instance = Otp.objects.create(user=user, otp=otp)
    otp_instance.save()

    send_otp_email(email, otp)

    return Response({
        'message': 'OTP sent to email successfully.',
            'user': {
                'id': user.id,
            }
        
    }, status=status.HTTP_200_OK)

# View to verify OTP and generate JWT tokens
class VerifyOtpView(APIView):
    permission_classes = [AllowAny]

    serializer_class = OtpSerializer
    def post(self,request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():

            refresh_token = RefreshToken.for_user(serializer.validated_data['user'])
            return Response({
                'refresh': str(refresh_token),
                'access': str(refresh_token.access_token),
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
# View to handle user registration with email and password
class PartialRegisterView(APIView):

    def post(self, request):
        serializer = PartialRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            email = user.email
            try:
                customer = Customer.objects.get(user=user)
            except Customer.DoesNotExist:
                return Response({"error": "Customer profile not found."}, status=status.HTTP_404_NOT_FOUND)
            otp = generate_otp()

            otp = generate_otp()
            Otp.objects.filter(user=user).delete()
            otp_instance = Otp.objects.create(user=user, otp=otp)
            otp_instance.save()
            send_otp_email(email, otp)

            return Response(
                {"message": "OTP sent to email successfully."},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CompleteProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        customer = request.user.customer
        serializer = CompleteProfileSerializer(customer, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Profile updated successfully."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class IsCompleteProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user   
            customer = Customer.objects.get(user=user)
            print(f'Customer profile for user {customer.user_name}: {customer}')

            is_complete = all([
            customer.phone_number and customer.phone_number != "0000000000",
            customer.address_line1 and customer.address_line1 != "xxxxx",
            customer.city and customer.city != "xxxxx",
            customer.state and customer.state != "xxxxx",
            customer.zip_code and customer.zip_code != "000000"
            ])

            return Response({
            "user": user.username,
            "is_complete": is_complete
            })
        except Customer.DoesNotExist:
            return Response({"error": "Customer profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
class StateListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        states = [choice[0] for choice in STATE_CHOICES]
        return Response({"states": states})
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_customer(request):
    try:
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        return Response(
            {"detail": "Customer profile not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = CustomerSerializer(customer)
    return Response(serializer.data)


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_customer(request):
    try:
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        return Response(
            {"detail": "Customer profile not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = CustomerSerializer(
        customer, data=request.data, partial=True
    )

    if serializer.is_valid():
        if serializer.is_valid():
            serializer.save()
            request.user.email = serializer.validated_data.get("email", request.user.email)
            request.user.save()
        return Response(
            {"message": "Profile updated successfully", "data": serializer.data}
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)