// types.ts
export interface Contact {
    email_address: string;
    phone_number: string;
}

export interface Address {
    address_line_1: string | null;
    address_line_2: string | null;
    area: string;
    province: string;
    country: string;
    postal_code: string | null;
}

export interface Project {
    name: string;
    description: string;
}

export interface Experience {
    job_title: string;
    company_name: string | null;
    start_date: string | null;
    end_date: string | null;
}

export interface Education {
    degree: string;
    institution: string;
    start_date: string;
    end_date: string;
}

export interface Interview {
    start_time: Date;          
    end_time: Date;            
    duration: number;    
    transcript: string;   
    summary: string;          
    recording_url: string;
    video_recording_url: string; 
    success_evaluation: number; 
}

export interface Candidate {
    candidate_id: number;
    name: string;
    interview_token: string | null;
    token_expiry: string | null;
    is_interviewed: boolean;
    is_valid: boolean;
    contact: Contact[];
    address: Address[];
    skills: string[];
    projects: Project[];
    experiences: Experience[];
    education: Education[];
    interviews: Interview[];
}