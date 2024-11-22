import os
import psycopg2
from passlib.context import CryptContext
import getpass
import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize the password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Function to hash a password
def hash_password(password: str):
    return pwd_context.hash(password)


# Function to create a new user with a specified role
def create_user(username, password, role):
    # Get database credentials from environment variables
    dbname = os.getenv("DBNAME")
    user = os.getenv("DBUSER")
    password_env = os.getenv("DBPASS")
    host = os.getenv("DBHOST")
    port = os.getenv("DBPORT")

    # Connect to the PostgreSQL database
    conn = psycopg2.connect(
        dbname=dbname, user=user, password=password_env, host=host, port=port
    )
    cursor = conn.cursor()

    # Hash the password before inserting it
    hashed_password = hash_password(password)

    # Insert the new user with the hashed password
    cursor.execute(
        """
        INSERT INTO "user" (username, hashed_password, role, created_at)
        VALUES (%s, %s, %s, NOW())
        """,
        (username, hashed_password, role),  # Use the hashed password here
    )

    # Commit changes and close the connection
    conn.commit()
    cursor.close()
    conn.close()

    print(f"User '{username}' created successfully with role '{role}'!")


if __name__ == "__main__":
    while True:
        username = input("Set Username: ")

        password = getpass.getpass(
            "Set Password: "
        ).strip()  # Securely get the password
        password_confirm = getpass.getpass(
            "Confirm Password: "
        ).strip()  # Securely get the password again

        if (
            password == password_confirm and password
        ):  # Check if passwords match and not empty
            create_user(username, password, role="user")  # Specify role as 'admin'
            break
        else:
            print("Passwords do not match or are empty. Please try again.")
