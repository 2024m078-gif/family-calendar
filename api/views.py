from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Event
from .serializers import EventSerializer

# これまでの予定管理用（これが必要！）
class EventViewSet(viewsets.ModelViewSet):
    # 'created_at' を 'id' に変更します
    queryset = Event.objects.all().order_by('-id') 
    serializer_class = EventSerializer

# 新しく追加するユーザー作成用
@api_view(['POST'])
def create_user(request):
    username = request.data.get('username')
    if not username:
        return Response({"error": "名前が必要です"}, status=status.HTTP_400_BAD_REQUEST)
    
    # すでに同じ名前のユーザーがいないかチェック
    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        return Response({"id": user.id, "name": user.username}, status=status.HTTP_200_OK)
    
    # ユーザーを作成
    user = User.objects.create_user(username=username, password='password123')
    return Response({"id": user.id, "name": user.username}, status=status.HTTP_201_CREATED)