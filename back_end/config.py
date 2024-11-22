import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    UPLOAD_FOLDER = './uploads'
    ALLOWED_ORIGINS = ["*"]
    HOST = "127.0.0.1"
    PORT = 8000
    DATABASE_URL = f"postgresql://{os.getenv('DBUSER')}:{os.getenv('DBPASS')}@{os.getenv('DBHOST')}:{os.getenv('DBPORT')}/{os.getenv('DBNAME')}"
    FROM_EMAIL = os.getenv('FROM_EMAIL')
    EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')

settings = Settings()