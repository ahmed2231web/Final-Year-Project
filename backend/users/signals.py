from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from djoser import utils
from django.contrib.auth.tokens import default_token_generator


User = get_user_model()

@receiver(post_save, sender=User)
def send_activation_email(sender, instance, created, **kwargs):
    if created and not instance.is_active:
        # Generate activation token and UID
        uid = utils.encode_uid(instance.pk)
        token = default_token_generator.make_token(instance)

        # Build activation URL
        activation_url = f"{settings.FRONTEND_DOMAIN}/activate/{uid}/{token}/"

        # Email content
        subject = "Activate Your Account"
        message = f"You're receiving this email because you need to finish the activation process on {settings.SITE_NAME}.\n \nClick the link to activate your account: {activation_url}"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [instance.email]

        # Send email
        send_mail(subject, message, from_email, recipient_list)

@receiver(post_save, sender=User)
def send_confirmation_email(sender, instance, created, **kwargs):
    if not created and instance.is_active:
        # Email content
        subject = "Your Account is Activated"
        message = f"You're receiving this email because you have successfully activated your account on {settings.SITE_NAME}.\n \nYour account is now active and you can log in."
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [instance.email]

        # Send email
        send_mail(subject, message, from_email, recipient_list)