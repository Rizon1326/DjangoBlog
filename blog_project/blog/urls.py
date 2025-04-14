# blog/urls.py
from django.urls import path
from .views import Register,VerifyOTP, Login,UserDetails,BlogDetail, BlogList,SpecificUserBlog,SpecificUserDraftBlog,SpecificUserPublishedBlog, BlogCreate, BlogEdit,BlogDelete, CommentCreate, CommentView, CommentReply
from .views import NotificationList, NotificationMarkAsRead, NotificationMarkAllAsRead

urlpatterns = [
    # User related urls
    path('register/', Register.as_view()),  
    path('verify/', VerifyOTP.as_view()),  
    path('login/', Login.as_view()), 
    path('user/', UserDetails.as_view()),
    path('user/<int:pk>/', UserDetails.as_view()),
   
    # Blog URLs
    path('', BlogList.as_view()),            
    path('create/', BlogCreate.as_view()), 
    path('<int:pk>/', BlogDetail.as_view()),  
    path('<int:pk>/edit/', BlogEdit.as_view()),
    path('<int:pk>/delete/', BlogDelete.as_view()),
    
    path('user/blogs/', SpecificUserBlog.as_view()),
    path('user/blogs/draft/', SpecificUserDraftBlog.as_view()),  # For draft blogs
    path('user/blogs/post/', SpecificUserPublishedBlog.as_view()),  # For published blogs

    # Comment URLs
    path('<int:pk>/comments/make/', CommentCreate.as_view()),
    path('<int:pk>/comments/', CommentView.as_view()),
    path('<int:pk>/comments/<int:comment_pk>/reply/', CommentReply.as_view()),


    # Notification URLs
    path('notifications/', NotificationList.as_view()),
    path('notifications/<int:pk>/read/', NotificationMarkAsRead.as_view()),
    path('notifications/read-all/', NotificationMarkAllAsRead.as_view()),

]
