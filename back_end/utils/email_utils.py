import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings

def send_interview_email(to_email, subject, body):
    msg = MIMEMultipart()
    msg['From'] = settings.FROM_EMAIL
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(settings.FROM_EMAIL, settings.EMAIL_PASSWORD)
            text = msg.as_string()
            server.sendmail(settings.FROM_EMAIL, to_email, text)
            print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Error sending email: {e}")