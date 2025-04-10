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
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.


class RegisterUser(APIView):
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
        
class LoginUser(APIView):
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

class PostBlog(APIView):
    permission_classes = [IsAuthenticated]  

    def post(self, request):
        # Get the data from the request
        data = request.data

        # Set the current logged-in user as the author of the blog
        data['author'] = request.user.id  # Set the user (logged-in user) as the author

        # Create the blog post using the serializer
        serializer = BlogSerializer(data=data)

        if serializer.is_valid():
            serializer.save()  # Save the blog post
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# all user blog gula ke dekhte parbe
# @api_view(['GET'])
class ViewAllBlogs(APIView):
    def get(self, request):
        blogs = Blog.objects.all()
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data)
    
# ekta user er blog gula ke dekhte parbe

class ViewSpecificBlog(APIView):
    def get(self, request, pk):
        try:
            blog = Blog.objects.get(id=pk)
            serializer = BlogSerializer(blog)
            return Response(serializer.data)
        except Blog.DoesNotExist:
            return Response({'error': 'Blog not found'}, status=status.HTTP_404_NOT_FOUND)

   
