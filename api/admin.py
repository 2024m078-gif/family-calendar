# api/admin.py
from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    # mental_load_display を削除し、end を追加
    list_display = ('id', 'title', 'user', 'start', 'end')
    
    # フィルタリングからも mental_load を削除
    list_filter = ('user', 'start')
    
    search_fields = ('title',)
    date_hierarchy = 'start'

    # mental_load_display 関数も不要になったので削除してOKです