# UsersReg/accounts/views.py
from django.shortcuts import render # type: ignore
from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from .serializer import *
from .emails import *
from .models import User    
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.decorators import permission_classes
# from rest_framework_simplejwt.authentication import JWTAuthentication
# from rest_framework.authentication import SessionAuthentication, BasicAuthentication
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.decorators import authentication_classes
# from rest_framework.decorators import permission_classes
# from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.


class RegisterAPI(APIView):
    def post(self, request):
        try:
            data = request.data
            serializer = UserSerializer(data=data)
            if serializer.is_valid():
                email = serializer.validated_data['email']
                password = serializer.validated_data['password']
               
                if User.objects.filter(email=email).exists():
                    return Response({'status': False, 'message': 'Email already exists'}, status=400)
                
                user = User.objects.create(email=email, is_active=True)
                user.set_password(password)  
                user.save()
                send_otp_via_email(email)  # Send OTP email
                return Response({'status': True, 'message': 'Check your email for OTP'}, status=201)
            return Response(serializer.errors, status=400)
        except Exception as e:
            return Response({'status': False, 'message': str(e)})
        

class VerifyOTP(APIView):
    def post(self, request):
        try:
            serializer = VerifyAccountSerializer(data=request.data)
            if serializer.is_valid():
                email = serializer.validated_data['email']
                otp = serializer.validated_data['otp']
                user = User.objects.filter(email=email, otp=otp).first()
                if user:
                    user.is_verified = True  # Mark as verified
                    user.otp = ''  # Clear OTP after successful verification
                    user.save()
                    return Response({'status': True, 'message': 'Account Verified Successfully'})
                return Response({'status': False, 'message': 'Invalid OTP'}, status=400)
            return Response(serializer.errors, status=400)
        except Exception as e:
            return Response({'status': False, 'message': str(e)})
        
class LoginAPI(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            user = authenticate(request, email=email, password=password)

            if not user:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

            if not user.is_verified:
                return Response({"error": "Please verify your email first"}, status=status.HTTP_400_BAD_REQUEST)

            refresh = RefreshToken.for_user(user)
            msg = "Login successful"
            access_token = str(refresh.access_token)

            return Response({"access_token": access_token,"message":msg}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
