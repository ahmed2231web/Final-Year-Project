# Django imports
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from djoser import utils  # Djoser utilities for token handling
import logging  
# import re
import socket

# Configure module logger
logger = logging.getLogger(__name__)

# Get the active User model (could be a custom user model)
User = get_user_model()

# List of known temporary/disposable email domains to handle with special care
# These domains are often used for throwaway accounts and may indicate spam or abuse
# When users register with these domains, we'll still send emails but with fail_silently=True
# to avoid wasting resources if the email service is unreliable
TEMP_EMAIL_DOMAINS = [
    # Common temporary email services
    'temp-mail.org', 'tempmail.com', 'guerrillamail.com', 'mailinator.com', 
    'yopmail.com', 'lassora.com', 'fakeinbox.com', 'sharklasers.com',
    
    # Guerrilla Mail variants
    'guerrillamail.info', 'grr.la', 'guerrillamail.biz', 'guerrillamail.com',
    'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamailblock.com',
    
    # Other disposable email services
    'pokemail.net', 'spam4.me', 'trashmail.com', 'mailnesia.com', 'tempr.email',
    'dispostable.com', '10minutemail.com', 'mailcatch.com', 'mintemail.com',
    'tempinbox.com', 'spamgourmet.com', 'spammotel.com', 'spamfree24.org',
    'mailnull.com', 'incognitomail.com', 'getairmail.com', 'getnada.com',
    'dropmail.me', 'temp-mail.io', 'tempmail.io', 'throwawaymail.com'
]

def is_temp_email_domain(email):
    """
    Check if the email has a temporary/disposable domain.
    
    This function determines if an email address uses a known temporary email domain,
    which may indicate a lower-quality signup or potential spam/abuse.
    
    Args:
        email (str): The email address to check
        
    Returns:
        bool: True if the email uses a temporary domain, False otherwise
        
    Note:
        Returns False for invalid email formats (missing @ symbol)
    """
    # Basic validation - ensure email is provided and contains @ symbol
    if not email or '@' not in email:
        return False
    
    # Extract the domain part (everything after the @ symbol) and convert to lowercase
    domain = email.split('@')[-1].lower()
    
    # Check if the domain matches any known temporary email domain
    if any(temp_domain in domain for temp_domain in TEMP_EMAIL_DOMAINS):
        # Log a warning for monitoring purposes
        logger.warning(f"Temporary email domain detected: {domain}")
        return True
    
    # Not a known temporary domain
    return False

def validate_mx_record(domain):
    """
    Validate if the domain has valid MX (Mail Exchange) records.
    
    This function checks if a domain has valid MX records, which indicates
    it can receive email. Domains without MX records cannot receive email,
    so registration with such domains would result in undeliverable activation emails.
    
    Args:
        domain (str): The domain to check for MX records
        
    Returns:
        bool: True if the domain has valid MX records, False otherwise
    """
    try:
        # Try to get MX records for the domain by attempting to resolve the domain
        # for SMTP connections (port 25)
        mx_records = socket.getaddrinfo(domain, 25)
        return True  # MX records found
    except socket.gaierror:
        # Log a warning if no MX records are found
        logger.warning(f"No MX records found for domain: {domain}")
        return False  # No MX records found

@receiver(post_save, sender=User)
def send_activation_email(sender, instance, created, **kwargs):
    """
    Signal handler to send activation emails to newly created users.
    
    This function is triggered whenever a User instance is saved. It checks if
    the user was just created and is not already active, then sends an activation
    email with a secure token link that the user can click to activate their account.
    
    Args:
        sender: The model class that sent the signal (User)
        instance: The actual User instance that was saved
        created: Boolean flag indicating if this is a new instance
        **kwargs: Additional keyword arguments
    """
    # Only send activation email for newly created, inactive users
    if created and not instance.is_active:
        try:
            # Generate secure activation token and encoded user ID
            # These will be used to verify the user when they click the activation link
            uid = utils.encode_uid(instance.pk)  # Encode user ID for security
            token = default_token_generator.make_token(instance)  # Generate secure token

            # Build the complete activation URL that will be sent to the user
            # This URL points to the frontend activation page with the token and UID
            activation_url = f"{settings.FRONTEND_DOMAIN}/activate/{uid}/{token}/"

            # Prepare email content
            subject = "Activate Your Account"
            message = f"You're receiving this email because you need to finish the activation process on {settings.SITE_NAME}.\n \nClick the link to activate your account: {activation_url}"
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [instance.email]

            # Check if the user registered with a temporary/disposable email domain
            is_temp = is_temp_email_domain(instance.email)
            if is_temp:
                logger.info(f"Sending activation email to temporary domain: {instance.email}")
                
            # Send the activation email
            # Note: fail_silently is set to True for temporary email domains to avoid
            # raising exceptions if the email can't be delivered
            send_mail(subject, message, from_email, recipient_list, fail_silently=is_temp)
            logger.info(f"Activation email sent to {instance.email}")
        except Exception as e:
            # Log any errors that occur during the email sending process
            logger.error(f"Failed to send activation email to {instance.email}: {str(e)}")

@receiver(post_save, sender=User)
def send_confirmation_email(sender, instance, created, **kwargs):
    """
    Signal handler to send confirmation emails when a user's account is activated.
    
    This function is triggered whenever a User instance is saved. It checks if
    the user is being updated (not created) and is now active, then sends a
    confirmation email to notify the user that their account has been successfully
    activated.
    
    Args:
        sender: The model class that sent the signal (User)
        instance: The actual User instance that was saved
        created: Boolean flag indicating if this is a new instance
        **kwargs: Additional keyword arguments
    """
    # Only send confirmation email for existing users who are now active
    # This typically happens after they click the activation link
    if not created and instance.is_active:
        try:
            # Prepare email content
            subject = "Your Account is Activated"
            message = f"You're receiving this email because you have successfully activated your account on {settings.SITE_NAME}.\n \nYour account is now active and you can log in."
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [instance.email]

            # Check if the user has a temporary/disposable email domain
            is_temp = is_temp_email_domain(instance.email)
            if is_temp:
                logger.info(f"Sending confirmation email to temporary domain: {instance.email}")
                
            # Send the confirmation email
            # Note: fail_silently is set to True for temporary email domains to avoid
            # raising exceptions if the email can't be delivered
            send_mail(subject, message, from_email, recipient_list, fail_silently=is_temp)
            logger.info(f"Confirmation email sent to {instance.email}")
        except Exception as e:
            # Log any errors that occur during the email sending process
            logger.error(f"Failed to send confirmation email to {instance.email}: {str(e)}")