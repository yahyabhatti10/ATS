// @Server: Meeting Server
// @Route: http://127.0.0.1:8000/end_Interview/${token}
// @Params: token

import { ResumeData } from "@/types/types";

export const endInterview = async (token: string | undefined) => {
    try {
        const response = await fetch(`http://localhost:8000/end_interview/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error ending the interview');
        }

        const data = await response.json();
        console.log('Interview ended successfully:', data);
    } catch (error) {
        console.error('There was an error:', error);
    }
};


// @Server: Resume Server
// @Route: http://127.0.0.1:8000/api/resume/upload/
// @Params: file

export const uploadResume = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://127.0.0.1:8000/api/v1/resume/upload/", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("API request failed");
    }

    return response.json();
};

// @Server: Resume Server
// @Route: http://127.0.0.1:8000/api/resume/retrieve/
// @Params: filename

export const retrieveResume = async (filename: string): Promise<any> => {
    const response = await fetch(`http://127.0.0.1:8000/api/v1/resume/retrieve/?filename=${encodeURIComponent(filename)}`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Resume retrieval failed");
    }

    // Directly return the complete response as JSON
    return response.json();
};


// @Server: Meeting Server
// @Route: http://127.0.0.1:8000/api/interview/schedule/  
// @Params: candidate_id

export const scheduleInterview = async (candidate_id: number) => {
    const formData2 = { candidate_id };

    const response = await fetch("http://127.0.0.1:8000/api/v1/interview/schedule/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData2),
    });

    if (!response.ok) {
        throw new Error("There was an error scheduling the interview");
    }

    return response.json();
};


// @Server: Meeting Server
// @Route: http://127.0.0.1:8000/api/resume/submit/               
// @Params: candidate_id

export const submitResume = async (data: ResumeData | null) => {

    const response = await fetch("http://127.0.0.1:8000/api/v1/resume/submit/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("There was an error submiting data");
    }

    return response.json();
};



// @Server: Meeting Server
// @Route: http://127.0.0.1:8000/api/interview/validate_interview_link/{id}
// @Params: id
export const validateInterviewLink = async (id: string | undefined) => {
    const response = await fetch(`http://127.0.0.1:8000/api/v1/interview/validate_interview_link/${id}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error("Failed to validate interview link.");
    }

    return response.json();
};


// @Server: Meeting Server
// @Route: http://127.0.0.1:8000/api/v1/jobs/
export const getJobs = async (pageNumber: number) => {
    const response = await fetch(`http://127.0.0.1:8000/api/v1/jobs/?page=${pageNumber}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error("Failed to Get Jobs.");
    }

    return response.json();
};

// @Server: Meeting Server
// @Route: http://127.0.0.1:8000/api/v1/jobs/{id}
// @Params: id
export const getJob = async (id: number) => {
    const response = await fetch(`http://127.0.0.1:8000/api/v1/jobs/${id}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error(`Failed to Get Job with Job id ${id}.`);
    }

    return response.json();
};


// @Server: Meeting Server
// @Route: http://127.0.0.1:8000/api/v1/job_id/               
// @Params: job_id
// @body: candidate_id

export const submitApplication = async (job_id: number, candidate_id: string) => {

    const candidate = {
        "candidate_id": candidate_id
    }
    console.log(job_id)
    const response = await fetch(`http://127.0.0.1:8000/api/v1/jobs/apply/${job_id}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidate),
    });

    if (!response.ok) {
        throw new Error("There was an error submiting data");
    }

    return response.json();
};