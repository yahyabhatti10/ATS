# ATS (Applicant Tracking System)

This is an Applicant Tracking System (ATS) built with a FastAPI backend and a React frontend. It uses SQLAlchemy for database operations and integrates with VAPI for AI-powered interviews.

## Prerequisites

- Python 3.11+
- pip
- PostgreSQL
- Node.js and npm
- ngrok (for exposing local server to the internet)
- VAPI account (for AI-powered interviews)

## Backend Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ATS/back_end
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS and Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Set up your PostgreSQL database.

6. Create a `.env` file in the root directory with the following:
   ```
   DATABASE_URL=postgresql://username:password@localhost/database_name
   SECRET_KEY=your_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   OPENAI_API_KEY=your_openai_api_key
   VAPI_API_KEY=your_vapi_api_key
   VAPI_ASSISTANT_ID=your_vapi_assistant_id
   ```

7. Run database migrations:
   ```
   alembic upgrade head
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd ../front_end
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend root directory:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   VITE_VAPI_ASSISTANT_ID=your_vapi_assistant_id
   ```

## Running the Application

1. Start the backend server:
   ```
   cd ../back_end
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

2. In a new terminal, start ngrok to expose your local server:
   ```
   ngrok http 8000
   ```
   Note: It's important to run ngrok and the backend server simultaneously, both pointing to port 8000.

3. In another new terminal, start the frontend development server:
   ```
   cd ../front_end
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

4. Access the API documentation at `http://localhost:8000/docs`.

## VAPI Integration

1. Sign up for a VAPI account at [https://vapi.ai](https://vapi.ai).

2. Create a new AI assistant in the VAPI dashboard:
   - Go to "Assistants" and click "Create New Assistant".
   - Configure the assistant and note down the Assistant ID.

3. Set up the server URL:
   - Ensure ngrok is running: `ngrok http 8000`
   - In the VAPI dashboard, set the assistant's "Server URL" to:
     ```
     https://<your-ngrok-url>/api/v1/interview/vapi-end-of-call
     ```

4. Publish your assistant in the VAPI dashboard.

5. Update your `.env` files with the VAPI API key and Assistant ID as shown in the setup sections.

6. In your frontend code, initialize the VAPI client:
   ```javascript
   import { VapiClient } from '@vapi-ai/web';

   const vapiClient = new VapiClient({
     assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID,
   });
   ```

7. Implement the `/api/v1/interview/vapi-end-of-call` endpoint in your backend to handle interview results.

## VAPI Prompts

### Summary Prompt

You are an expert note-taker. Summarize the following interview conversation about [specific topic].

Guidelines:
1. Extract key points, themes, and insights from both participants.
2. Highlight important quotes (use quotation marks).
3. Briefly outline the interview structure.
4. Identify main arguments, viewpoints, and areas of agreement/disagreement.
5. Note any unanswered questions or areas for further exploration.
6. Conclude with the interview's overall significance.

Aim for 150- 200 words. Organize the summary logically, using paragraphs or bullet points as needed.

Your output: A clear, concise summary capturing the essence of the discussion and important takeaways.

### Success Evaluation Prompt

Evaluate the following interview based on these criteria:

1. Technical Knowledge (0-10):
   - Depth of expertise and problem-solving abilities
   - Understanding of relevant tools, technologies, and methodologies
   - Accuracy of responses to technical questions

2. Soft Skills (0-10):
   - Communication skills (clarity, conciseness, explaining complex concepts)
   - Teamwork, leadership, and adaptability
   - Response to feedback and challenging questions

3. Correctness & Efficiency (0-10):
   - Accuracy and efficiency in problem-solving
   - Approach to technical challenges (steps, logic, effectiveness)

4. Compatibility (0-10):
   - Alignment with role requirements
   - Potential to meet job challenges and contribute to the team

Provide a brief evaluation for each criterion, including strengths and areas for improvement.

Conclude with:
1. An overall score (average of the four criteria scores)
2. A final recommendation on the candidate's fit for the position

Output: Only the final overall score (0-10).

## API Endpoints

- `/candidates`: Manage candidate information
- `/jobs`: Manage job listings
- `/applications`: Handle job applications
- `/interviews`: Manage interview scheduling and results

For detailed API documentation, refer to the Swagger UI at `/docs`.

## Development

- Backend:
  - `models.py`: SQLAlchemy models
  - `schemas.py`: Pydantic models
  - `services/`: Business logic
  - `routers/`: API routes

- Frontend:
  - `src/components/`: React components
  - `src/services/api.js`: API calls using RTK Query
  - `src/features/`: Redux slices

## Note on ngrok and Backend

It's crucial to run both ngrok and the backend server simultaneously, both configured to use port 8000. This setup allows ngrok to properly forward external requests to your local backend server, enabling VAPI to communicate with your application.
