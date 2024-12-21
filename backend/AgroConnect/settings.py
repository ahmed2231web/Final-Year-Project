import os
from pathlib import Path
from os import getenv
from dotenv import load_dotenv
from urllib.parse import urlparse
from datetime import timedelta

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = getenv("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # libraries
    'djoser',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',

    # project apps
    'users'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # cors middleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'AgroConnect.urls'


CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_CREDENTIALS = True


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'AgroConnect.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

tmpPostgres = urlparse(getenv("DATABASE_URL"))

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'AgroConnect',  # Removes the leading '/'
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432',
        # 'OPTIONS': {
        #     'sslmode': 'require'  # As specified in the URL
        # },
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


AUTH_USER_MODEL = 'users.CustomUser'


# Configure django-rest-framework-simplejwt to use the Authorization: JWT <access_token> header
SIMPLE_JWT = {
   # Specifies that the token type will be 'JWT' in the Authorization header
   "AUTH_HEADER_TYPES": ('JWT',),

   # Sets how long an access token remains valid (30 minutes)
   "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),

   # Sets how long a refresh token remains valid (1 day)
   "REFRESH_TOKEN_LIFETIME": timedelta(days=1),

   # If True, updates the user's last login timestamp when tokens are created
   "UPDATE_LAST_LOGIN": True,
}


#? JSON Web Token Authentication
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

# Djoser Configurations
DJOSER = {
    # Use phoneNumber as the login field instead of username
    'LOGIN_FIELD': 'phoneNumber',
    
    # Force password retyping during user creation
    'USER_CREATE_PASSWORD_RETYPE': True,

    # Force password retyping when setting a new password
    'SET_PASSWORD_RETYPE': True,

    # Enable sending activation emails
    'SEND_ACTIVATION_EMAIL': False,

    # Enable sending confirmation emails
    'SEND_CONFIRMATION_EMAIL': False,

    # Send email confirmation when password is changed
    'PASSWORD_CHANGED_EMAIL_CONFIRMATION': True,

    # URL for password reset
    'PASSWORD_RESET_CONFIRM_URL': '/password-reset/{uid}/{token}',

    # Show email not found message during password reset
    'PASSWORD_RESET_SHOW_EMAIL_NOT_FOUND': True,

    # Disable default token model
    'TOKEN_MODEL': None,

    # Serializers
    'SERIALIZERS': {
        # Custom serializer for user creation - handles how user data is serialized during registration
        'user_create': 'users.serializers.UserCreateSerializer',
        
        # Custom serializer for user details - handles how user data is serialized when retrieving user information
        'user': 'users.serializers.UserDetailSerializer',
        
        # Default Djoser serializer for user deletion - handles user account deletion
        'user_delete': 'djoser.serializers.UserDeleteSerializer',
        
        # When True, generates new refresh token after each refresh token use
        # Enhances security by rotating tokens regularly
        "ROTATE_REFRESH_TOKENS": True,
        
        # When True, adds used refresh tokens to blacklist after rotation
        # Prevents reuse of old refresh tokens, improving security
        "BLACKLIST_AFTER_ROTATION": True,
        
        # When False, doesn't update last login timestamp
        # Can improve performance by reducing database writes
        "UPDATE_LAST_LOGIN": True,
    }
}