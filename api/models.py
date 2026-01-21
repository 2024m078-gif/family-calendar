from django.db import models
from django.contrib.auth.models import User

class Event(models.Model):
    # 登録者（家族メンバー）
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # 予定の内容
    title = models.CharField(max_length=100, verbose_name="予定名")
    
    # 時間設定（DateTimeFieldにすることで「時間」まで保存可能に）
    start = models.DateTimeField(verbose_name="開始日時")
    end = models.DateTimeField(verbose_name="終了日時")

    class Meta:
        verbose_name = "予定"
        verbose_name_plural = "予定リスト"
        ordering = ['start'] # 時間が早い順に並べる

    def __str__(self):
        return self.title
    