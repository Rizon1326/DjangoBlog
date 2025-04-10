
from django.urls import path
from accounts.views import *

urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
    path('verify/', VerifyOTP.as_view(), name='verify'),
    path('login/', LoginUser.as_view(), name='login'),
    path('postblog/', PostBlog.as_view(), name='postblog'),
    path('viewblog/', ViewAllBlogs.as_view(), name='viewblog'),
    path('viewblog/<int:pk>/', ViewSpecificBlog.as_view(), name='viewblog'),
   
]