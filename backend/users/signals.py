from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from djoser import utils
from django.contrib.auth.tokens import default_token_generator
import logging
import re
import socket

logger = logging.getLogger(__name__)
User = get_user_model()

# List of known temporary email domains to handle with care
TEMP_EMAIL_DOMAINS = [
    'temp-mail.org', 'tempmail.com', 'guerrillamail.com', 'mailinator.com', 
    'yopmail.com', 'lassora.com', 'fakeinbox.com', 'sharklasers.com',
    'guerrillamail.info', 'grr.la', 'guerrillamail.biz', 'guerrillamail.com',
    'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamailblock.com',
    'pokemail.net', 'spam4.me', 'trashmail.com', 'mailnesia.com', 'tempr.email',
    'dispostable.com', '10minutemail.com', 'mailcatch.com', 'mintemail.com',
    'tempinbox.com', 'spamgourmet.com', 'spammotel.com', 'spamfree24.org',
    'mailnull.com', 'incognitomail.com', 'getairmail.com', 'getnada.com',
    'dropmail.me', 'temp-mail.io', 'tempmail.io', 'throwawaymail.com'
]

def is_temp_email_domain(email):
    """Check if the email has a temporary domain"""
    if not email or '@' not in email:
        return False
    
    domain = email.split('@')[-1].lower()
    
    # Check if it's a known temporary email domain
    if any(temp_domain in domain for temp_domain in TEMP_EMAIL_DOMAINS):
        logger.warning(f"Temporary email domain detected: {domain}")
        return True
    
    return False

def validate_mx_record(domain):
    """Validate if the domain has valid MX records"""
    try:
        # Try to get MX records for the domain
        mx_records = socket.getaddrinfo(domain, 25)
        return True
    except socket.gaierror:
        logger.warning(f"No MX records found for domain: {domain}")
        return False

@receiver(post_save, sender=User)
def send_activation_email(sender, instance, created, **kwargs):
    if created and not instance.is_active:
        try:
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

            # Check if it's a temporary email domain
            is_temp = is_temp_email_domain(instance.email)
            if is_temp:
                logger.info(f"Sending activation email to temporary domain: {instance.email}")
                
            # Send email
            send_mail(subject, message, from_email, recipient_list, fail_silently=is_temp)
            logger.info(f"Activation email sent to {instance.email}")
        except Exception as e:
            logger.error(f"Failed to send activation email to {instance.email}: {str(e)}")

@receiver(post_save, sender=User)
def send_confirmation_email(sender, instance, created, **kwargs):
    if not created and instance.is_active:
        try:
            # Email content
            subject = "Your Account is Activated"
            message = f"You're receiving this email because you have successfully activated your account on {settings.SITE_NAME}.\n \nYour account is now active and you can log in."
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [instance.email]

            # Check if it's a temporary email domain
            is_temp = is_temp_email_domain(instance.email)
            if is_temp:
                logger.info(f"Sending confirmation email to temporary domain: {instance.email}")
                
            # Send email
            send_mail(subject, message, from_email, recipient_list, fail_silently=is_temp)
            logger.info(f"Confirmation email sent to {instance.email}")
        except Exception as e:
            logger.error(f"Failed to send confirmation email to {instance.email}: {str(e)}")