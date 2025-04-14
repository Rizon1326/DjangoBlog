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
from .tasks import create_blog_notification
from .tasks import create_comment_notification
from .tasks import create_comment_notification



from .tasks import create_blog_notification

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
        )
        user.is_verified = False
       
        user.save()
        send_otp_via_email(email)
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

# UserDetails T fetch the user details
class UserDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if pk:
            user = get_object_or_404(User, pk=pk)
        else:
            user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)


# Blog Related views
class BlogCreate(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        status_value = request.data.get('status', 'draft')  
        request.data['status'] = status_value
        request.data['author'] = request.user.id  
        
        serializer = BlogSerializer(data=request.data)
        
        if serializer.is_valid():
            blog = serializer.save()
            
            if blog.status == 'post':
                create_blog_notification.delay(blog.id)
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# Blog List 
class BlogList(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        blogs = Blog.objects.all()
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data)
# Blog Detail
class BlogDetail(APIView):
    permission_classes = [AllowAny]
    def get(self, request, pk):
        blog = get_object_or_404(Blog, pk=pk)
        serializer = BlogSerializer(blog)
        return Response(serializer.data) 
       
# Specific User Blog
class SpecificUserBlog(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        user = request.user
        blogs = Blog.objects.filter(author=user)  
      
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
# Specific User Draft Blog
class SpecificUserDraftBlog(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        blogs = Blog.objects.filter(author=user, status='draft')  
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# Specific User Published Blog
class SpecificUserPublishedBlog(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user
        blogs = Blog.objects.filter( status='post')  
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
 
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

# Blog Delete
class BlogDelete(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, pk):
        blog = get_object_or_404(Blog, pk=pk)
        if blog.author != request.user:
            return Response({'detail': 'Permission Denied'}, status=status.HTTP_403_FORBIDDEN)
        blog.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Comment Related views
class CommentCreate(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        blog = get_object_or_404(Blog, pk=pk)
        data = request.data.copy()
        data['author'] = request.user.id
        data['blog'] = blog.id

        if 'parent_comment' not in data:
            data['parent_comment'] = None
        data['parent_comment'] = None

        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            comment = serializer.save(author=request.user)
            
            create_comment_notification.delay(comment.id)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class CommentView(APIView):
    def get(self, request, pk):
        comments = Comment.objects.filter(blog=pk)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

class CommentReply(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, comment_pk):
        blog = get_object_or_404(Blog, pk=pk)
        parent_comment = get_object_or_404(Comment, pk=comment_pk, blog=blog)
        
        data = request.data.copy()
        data['author'] = request.user.id
        data['blog'] = blog.id
        data['parent_comment'] = parent_comment.id

        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            comment = serializer.save(author=request.user)
            
            # Trigger notification for the parent comment author
            if parent_comment.author != request.user:
                create_comment_notification.delay(comment.id)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, pk, comment_pk):
        replies = Comment.objects.filter(parent_comment=comment_pk)
        serializer = CommentSerializer(replies, many=True)
        return Response(serializer.data)

# Notification Related views

class NotificationList(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class NotificationMarkAsRead(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({"status": "Notification marked as read"})

class NotificationMarkAllAsRead(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "All notifications marked as read"})
    


# class CommentCreate(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, pk):
#         blog = get_object_or_404(Blog, pk=pk)
#         data = request.data
#         data['author'] = request.user.id
#         data['blog'] = blog.id
#         data['parent_comment'] = None

#         serializer = CommentSerializer(data=data)
#         if serializer.is_valid():
#             comment = serializer.save(author=request.user)
            
#             create_comment_notification.delay(comment.id)
            
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)