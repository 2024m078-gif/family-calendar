import os
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv

# 1. プロジェクトの基本パスを設定 (これが抜けていました！)
BASE_DIR = Path(__file__).resolve().parent.parent

# 2. .envファイルの読み込み
load_dotenv()

# 3. セキュリティ設定（環境変数から読み込む）
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-default-key')
DEBUG = os.environ.get('DEBUG') == 'True'

# 4. 許可するホスト
ALLOWED_HOSTS = ['*']

# アプリケーション定義
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    'corsheaders',
    'rest_framework',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # 順番重要：一番上
    "django.middleware.security.SecurityMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware', # WhiteNoiseを追加
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# 5. データベース設定
# Renderでは環境変数を使い、ローカルではsqliteを使います
DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600
    )
}

# 6. パスワードバリデーション (標準設定)
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# 7. 日本語・時間設定
LANGUAGE_CODE = "ja"
TIME_ZONE = 'Asia/Tokyo'
USE_I18N = True
USE_TZ = False 

# 8. 静的ファイルの設定
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / 'staticfiles' # 本番用

# 9. CORS設定
CORS_ALLOW_ALL_ORIGINS = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"