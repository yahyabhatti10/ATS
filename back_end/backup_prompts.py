RESUME_PARSING_PROMPT = """
Extract the following information from the resume:
- Name (write null if not found)
- Email (write null if not found)
- Phone Number (write null if not found)
- All Skills (comma-separated, write null if not found)
- Education (most recent degree and institution, start_date, end_date; write null if not found)
- All Projects (project names and descriptions in the format 'name: description', write null if not found)
- All Experiences (job titles, company names, start dates, and end dates in the format 'job_title: company_name (start_date - end_date)', write null if not found)
Resume Text:
{text}

Provide the extracted information in a flat JSON object like this below and don't write anything else:
user input: Name: John Doe, Email: null, Phone Number: null, Skills: Python, JavaScript, SQL, 
Education: BSc in Computer Science from University A, Projects: Project A: Description A, Project B: Description B, 
Experiences: Software Engineer: Tech Corp (2020-01-01 - present), Intern: Company B (2019-01-01 - 2019-12-31), 
your response as a correctly formatted JSON object and don't write heading or description etc (only JSON object):
{{"name": "John Doe", "email": null, "phone_number": null, 
"skills": "Python, JavaScript, SQL", "education": {{"degree": "BSc Computer Science", "institution": "University A", "start_date": "2015", "end_date": "2019"}}, 
"projects": [{{"name": "Project A", "description": "Description A"}}, {{"name": "Project B", "description": "Description B"}}], 
"experiences": [{{"job_title": 'Software Engineer', "company_name": 'Tech Corp', "start_date": '2020-01-01', "end_date": 'present'}}, 
{{"job_title": 'Intern', "company_name": 'Company B', "start_date": '2019-01-01', "end_date": '2019-12-31'}}], 
"education" {{"degree": 'BSc Computer Science', "institution": 'University A', "start_date": '2015', "end_date": '2019'}}}}
"""

# Generates ~300-word job description JSON with overview,  responsibilities, and  skills based on title and keywords
JOB_DESCRIPTION_PROMPT = """
# Job Description Generator 🚀

Your Responsibilities
- Create a detailed job description using the provided title and keywords.
- Use simple, professional language that sounds natural and human-written.
- Ensure excellent readability and easy understanding.
- Tailor the content specifically to the job role and industry.

Format
- Write a job description of approximately 300 words.
- Structure the description in JSON format with three main sections: overview, key_responsibilities, and required_skills.
- The overview should be 2-3 sentences, offering a concise but informative introduction to the role.
- Include  key responsibilities relevant to the job title and keywords.
- List  required skills, incorporating the provided keywords where appropriate.
- Use UNICODE characters for emphasis if needed.
- Always use emojis to make the description more engaging.

Return only the JSON object, without any additional text or formatting.

Generate a job description for {title}. Use these keywords: {keywords}

Example description:

```
overview:
We're seeking a talented Full Stack Developer to join our innovative team. You'll work on cutting-edge web applications, leveraging both front-end and back-end technologies. This role offers opportunities to contribute to diverse projects, collaborate with a dynamic team, and drive our company's growth in a fast-paced environment.
🔧 Key Responsibilities:
• Develop web applications using modern frameworks
• Build server-side applications and RESTful APIs
• Implement responsive design and optimize performance
• Collaborate with team members and participate in code reviews
• Troubleshoot and debug full-stack issues
 Required Skills:
• Proficiency in JavaScript, HTML5, CSS3
• Experience with React.js, Angular, or Vue.js
• Knowledge of Node.js and Express.js
• Familiarity with databases and RESTful API design
• Understanding of version control, web security, and cloud platforms
• Experience with Agile methodologies

```

"""



# Evaluates candidate-job match, providing a 0-10 score and brief explanation based on skills, experience, education, and qualifications
MATCHING_EVALUATION_PROMPT = """
Job Details:
{job_details}

Candidate Resume:
{parsed_resume}

Evaluation Criteria:
1. Skills Match: Compare required job skills with candidate's skills. Weight: 40%
2. Experience Relevance: Assess how candidate's experience aligns with job requirements. Weight: 30%
3. Education Fit: Evaluate if candidate's education meets job requirements. Weight: 15%
4. Additional Qualifications: Consider certifications, projects, or other relevant factors. Weight: 15%

Instructions:
- Provide a match score between 0 and 10 (use one decimal place if needed).
- Offer a concise explanation (max 100 words) highlighting key match points and any significant gaps.
- Consider both explicit matches and inferred skills/experience from the resume.
- Pay attention to the job's specific requirements and how well the candidate meets them.

Provide the extracted information in a flat JSON object like this below and don't write anything else:
{{
    "match_score": <score>,
    "explanation": "<brief explanation>"
}}
"""

