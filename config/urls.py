# config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from api.views import EventViewSet,create_user

router = routers.DefaultRouter()
router.register(r'events', EventViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/users/create/', create_user),
]