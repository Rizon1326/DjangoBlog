
from django.urls import path
from accounts.views import *

urlpatterns = [
    path('login/', LoginAPI.as_view(), name='login'),
    path('register/', RegisterAPI.as_view(), name='register'),
    path('verify/', VerifyOTP.as_view(), name='verify'),
   
]