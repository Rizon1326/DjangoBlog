# blog/urls.py
from django.urls import path
from .views import Register, Login, BlogList, BlogDetail, BlogCreate, BlogEdit

urlpatterns = [
    
    path('register/', Register.as_view()),    
    path('login/', Login.as_view()),             
    
    # Blog URLs
    path('', BlogList.as_view()),            
    path('create/', BlogCreate.as_view()), 
    path('<int:pk>/', BlogDetail.as_view()),  
    path('<int:pk>/edit/', BlogEdit.as_view()) 
]
