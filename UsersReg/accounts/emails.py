# UsersReg/accounts/emails.py
from django.core.mail import send_mail
import random
from django.conf import settings
from .models import User

def send_otp_via_email(email):
    otp = random.randint(100000, 999999)
    subject = f'Your OTP for Email Verification'
    message = f'Your OTP for Email Verification is {otp}'
    email_from = settings.EMAIL_HOST_USER
    print(f"Sending OTP {otp} to {email}")  # Debug message to verify the email is being sent
    send_mail(subject, message, email_from, [email])
    user_obj = User.objects.get(email=email)
    user_obj.otp = otp
    user_obj.save()
