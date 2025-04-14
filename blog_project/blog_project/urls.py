
# blog_project/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    
    path('admin/', admin.site.urls),
    path('accounts/', include('blog.urls')),  
    path('blog/', include('blog.urls')), 
    # path('comments/', include('blog.urls')),
]
