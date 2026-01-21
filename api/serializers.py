# api/serializers.py
from rest_framework import serializers
from .models import Event
from django.contrib.auth.models import User

class EventSerializer(serializers.ModelSerializer):
    # 表示用の名前を取得。ユーザーが実在しない場合は None になる
    author_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Event
        fields = ['id', 'title', 'start', 'end', 'user', 'author_name']

    def validate_user(self, value):
        # 送られてきたユーザーIDがデータベースに存在するかチェックする機能を
        # 家族アプリ用にパス（スルー）させます。
        return value

    def create(self, validated_data):
        # もし送られてきた user ID が実在しない場合は、紐付けを解除して保存する
        user_obj = validated_data.get('user')
        # user_objがUserモデルのインスタンスでない（存在しないID）場合
        if not isinstance(user_obj, User):
            validated_data['user'] = None
        
        return super().create(validated_data)