from .models import *
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    class Meta:
        model = User
        fields = ['email', 'username', 'password']

    def validate(self, data):
        UserModel = get_user_model()
        email = data.get('email')
        password = data.get('password')

        
        try:
            if not UserModel.objects.filter(email=email).exists():
                raise serializers.ValidationError("Invalid email or password.")
            
            user = authenticate(email=email, password=password)
            if user is None:
                raise serializers.ValidationError("Invalid email or password.")
            
            if user.is_active == False:
                raise serializers.ValidationError("User account is inactive.")

            
        except UserModel.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")
        
        return {
            'user': user,
            'email': user.email,
            'username': user.username,
        }
    
class PartialRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['email', 'username', 'password']


    def create(self, validated_data):

        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )

        customer = Customer.objects.create(
            user=user,
            user_name=user.username,
            email=user.email,
            # phone_number="0000000000",
            address_line1="xxxxx",
            city="xxxxx",
            state="xxxxx",
            zip_code="000000"
        )

        return user

class CompleteProfileSerializer(serializers.ModelSerializer):
    address_line2 = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = Customer
        fields = [
            'phone_number',
            'address_line1',
            'address_line2',
            'city',
            'state',
            'zip_code'
        ]

# class OtpSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Otp
#         fields = ['user', 'otp']

#     def validate(self, data):
#         user = data.get('user')
#         otp = data.get('otp')

#         otp_obj = Otp.objects.filter(user=user, otp=otp).first()
#         if not otp_obj:
#             raise serializers.ValidationError("Invalid OTP.")
#         if not otp_obj.is_valid():
#             raise serializers.ValidationError("OTP has expired.")

#         data['otp_obj'] = otp_obj
#         return data

class OtpSerializer(serializers.ModelSerializer):
    class Meta:
        model = Otp
        fields = ['user', 'otp']

    def validate(self, data):
        user = data.get('user')
        otp = data.get('otp')

        otp_obj = Otp.objects.filter(user=user, otp=otp).first()
        if not otp_obj:
            raise serializers.ValidationError("Invalid OTP.")
        if not otp_obj.is_valid():
            raise serializers.ValidationError("OTP has expired. Please request a new one.")

        return data
    
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "user_name",
            "email",
            "phone_number",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "zip_code",
        ]

    def validate_phone_number(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits.")
        return value

    def validate_zip_code(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("ZIP code must be 6 digits.")
        return value

class ViewCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "user_name",
            "email",
            "phone_number",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "zip_code",
        ]