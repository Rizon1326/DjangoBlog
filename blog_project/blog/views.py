# blog/views.py
from rest_framework.permissions import IsAuthenticated, AllowAny # type: ignore
from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from .models import * 
from .serializers import *
from .emails import send_otp_via_email
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken # type: ignore
from django.shortcuts import get_object_or_404

User = get_user_model()

class Register(APIView):
    def post(self, request):
        data = request.data
        # User = get_user_model()
        email=data.get('email')
        if User.objects.filter(email=data['email']).exists():
            return Response({"detail": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            # first_name=data['first_name'],
            # last_name=data['last_name']
        )
        user.is_verified = False
       
        user.save()
        send_otp_via_email(email)

         # Send OTP to email
       

        return Response({"detail": "User registered successfully. Please verify your email."}, status=status.HTTP_201_CREATED)
  

class VerifyOTP(APIView):
    def post(self, request):
        try:
            serializer = VerifyAccountSerializer(data=request.data)
            if serializer.is_valid():
                email = serializer.validated_data['email']
                otp = serializer.validated_data['otp']
                user = User.objects.filter(email=email, otp=otp).first()
                if user:
                    user.is_verified = True  
                    user.otp = ''  
                    user.save()
                    return Response({'status': True, 'message': 'Account Verified Successfully'})
                return Response({'status': False, 'message': 'Invalid OTP'}, status=400)
            return Response(serializer.errors, status=400)
        except Exception as e:
            return Response({'status': False, 'message': str(e)})
        

class Login(APIView):
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

# UserDetails
class UserDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if pk:
            user = get_object_or_404(User, pk=pk)
        else:
            user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

# Blog List 
class BlogList(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        blogs = Blog.objects.all()
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data)


# class BlogDetail(APIView):
#     def get(self,request, pk):
#         blog = get_object_or_404(Blog, pk=pk)
#         serializer = BlogSerializer(blog)
#         return Response(serializer.data)

# Specific User Blog
class SpecificUserBlog(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        # Fetch blogs created by the logged-in user
        user = request.user
        blogs = Blog.objects.filter(author=user)  # Filter blogs by the logged-in user
        
        # Serialize the blog data
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Blog Create 
class BlogCreate(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Ensure the status field is included in the request data
        status_value = request.data.get('status', 'draft')  # Default to 'draft' if not provided

        # Add the status value to the data being passed to the serializer
        request.data['status'] = status_value

        # Automatically assign the current user as the author
        request.data['author'] = request.user.id  # Automatically set the author to the authenticated user

        # Serialize the data
        serializer = BlogSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()  # No need to manually set author here since it's already added to request.data
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Blog Edit 
class BlogEdit(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        blog = get_object_or_404(Blog, pk=pk)
        if blog.author != request.user:
            return Response({'detail': 'Permission Denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = BlogSerializer(blog, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Specific User Draft Blog
class SpecificUserDraftBlog(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        blogs = Blog.objects.filter(author=user, status='draft')  # Filter blogs by the logged-in user and status 'draft'
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# Specific User Published Blog
class SpecificUserPublishedBlog(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        blogs = Blog.objects.filter(author=user, status='post')  # Filter blogs by the logged-in user and status 'post'
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# 


# Blog Delete
class BlogDelete(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, pk):
        blog = get_object_or_404(Blog, pk=pk)
        if blog.author != request.user:
            return Response({'detail': 'Permission Denied'}, status=status.HTTP_403_FORBIDDEN)
        blog.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    

class CommentCreate(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        blog = get_object_or_404(Blog, pk=pk)
        data = request.data
        data['author'] = request.user.id
        data['blog'] = blog.id

        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class CommentEdit(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk,comment_pk):
        blog=get_object_or_404(Blog,pk=pk)
        comment = get_object_or_404(Comment, pk=comment_pk)
        if comment.author != request.user:
            return Response({'detail': 'Permission Denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CommentSerializer(comment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentDelete(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, comment_pk):
        comment = get_object_or_404(Comment, pk=comment_pk)
        if comment.author != request.user:
            return Response({'detail': 'Permission Denied'}, status=status.HTTP_403_FORBIDDEN)

        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
class CommentView(APIView):
    def get(self, request, pk):
        comments = Comment.objects.filter(blog=pk)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

class CommentReply(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, comment_pk):
        blog = get_object_or_404(Blog, pk=pk)
        parent_comment = get_object_or_404(Comment, pk=comment_pk)
        data = request.data
        data['author'] = request.user.id
        data['blog'] = blog.id
        data['parent_comment'] = parent_comment.id

        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)