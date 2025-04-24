from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.core.validators import RegexValidator
# from django.utils import timezone

import shortuuid


# Function to generate short UUIDs
def generate_short_uuid():
    """Generate a short UUID for user IDs"""
    return shortuuid.uuid()[:10]  # Using first 10 chars for brevity

# Custom user manager for handling user creation and superuser creation
class CustomUserManager(BaseUserManager):
    def create_user(self, phone_number, email, full_name, user_type, province=None, city=None, password=None, **extra_fields):
        '''
        Creates and saves a new user
        '''
        if not email:
            raise ValueError('Users must have an email address')

        # Create a new user instance with normalized email
        user = self.model(
            phone_number=phone_number,
            email=self.normalize_email(email),
            full_name=full_name,
            user_type=user_type,
            province=province,
            city=city,
            is_active = False,
            **extra_fields
        )

        user.set_password(password)  # Hash the password
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, email, full_name, user_type=None, province=None, city=None, password=None):
        '''
        Creates and saves a superuser with administrative privileges.
        Superusers are always created with ADMIN user_type.
        '''
        if user_type and user_type != self.model.UserType.ADMIN:
            raise ValueError('Superuser must have user_type=ADMIN')
        if not province:
            raise ValueError('Province field is required')
        if not city:
            raise ValueError('City field is required')

        user = self.create_user(
            phone_number=phone_number,
            email=email,
            full_name=full_name,
            user_type=self.model.UserType.ADMIN,
            province=province,
            city=city,
            password=password
        )
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save(using=self._db)
        return user

# Custom user model for the platform
class CustomUser(AbstractBaseUser):
    '''
    Custom user model for the platform
    '''

    id = models.CharField(
        primary_key=True,
        default=generate_short_uuid,
        editable=False,
        max_length=10,
        unique=True
    )

    class UserType(models.TextChoices):
        CUSTOMER = 'CUSTOMER', 'Customer'
        FARMER = 'FARMER', 'Farmer'
        ADMIN = 'ADMIN', 'Admin'  # Only for superusers

    email = models.EmailField(unique=True)

    full_name = models.CharField(max_length=100)

    # Phone number with format validation
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,14}$',
        message="Phone number must be entered in the format: '+921234567890'. Up to 14 digits allowed."
    )
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=15,
        unique=True
    )

    user_type = models.CharField(
        max_length=20,
        choices=UserType.choices,
        help_text='ADMIN type is reserved for superusers only'
    )

    province = models.CharField(
        max_length=20,
        error_messages={
            'blank': 'Province field is required',
            'null': 'Province field is required'
        }
    )

    city = models.CharField(
        max_length=30,
        error_messages={
            'blank': 'City field is required',
            'null': 'City field is required'
        }
    )

    date_joined = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'

    REQUIRED_FIELDS = ['full_name', 'phone_number', 'user_type', 'province', 'city']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        db_table = 'users'  # Custom table name in database

    def __str__(self):
        """String representation of the user"""
        return f"{self.full_name} ({self.user_type})"

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

# News Article model for the platform
class NewsArticle(models.Model):
    """
    Model to store news articles that will be displayed to farmers
    """
    CATEGORY_CHOICES = [
        ('farming_techniques', 'Farming Techniques'),
        ('government', 'Government'),
        ('climate', 'Climate'),
        ('technology', 'Technology'),
        ('sustainability', 'Sustainability'),
        ('general', 'General'),
    ]
    
    title = models.CharField(max_length=255, help_text="Title of the news article")
    description = models.TextField(help_text="Brief description or summary of the article")
    image = models.ImageField(upload_to='news_images/', help_text="Featured image for the article")
    article_url = models.URLField(help_text="External link to the original article")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    
    # Field to control visibility of the article
    is_active = models.BooleanField(default=True, help_text="Whether the article is visible to users")
    
    # Added timestamps for internal tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'News Article'
        verbose_name_plural = 'News Articles'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
        
    @property
    def image_url(self):
        """Return the complete URL for the image"""
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return None