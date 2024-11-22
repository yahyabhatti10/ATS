export interface CandidateData {
  candidate_id: string;
  name: string;
  contact: Contact[];
  address: Address[];
  skills: string[];
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  avatar?: string;
}

export interface Contact {
  email_address: string;
  phone_number: string;
}

export interface Address {
  address_line_1: string;
  address_line_2?: string; // Optional, if not all addresses have this field
  area: string;
  province: string;
  country: string;
  postal_code: string;
}

export interface Project {
  name: string;
  description: string;
}

export interface Experience {
  job_title: string;
  company_name: string;
  start_date: string; // Can be changed to `Date` type if dates are managed as `Date` objects
  end_date?: string;  // Can also be a `Date` or `null` if it's a current job
}

export interface Education {
  degree: string;
  institution: string;
  start_date: string;  // Can also be `Date` type
  end_date?: string;   // Can also be `Date` type or `null`
}


export interface ResumeEducation {
  degree: string;
  institution: string;
  start_date: string;
  end_date: string;
}

export interface ResumeProject {
  name: string;
  description: string;
}

export interface ResumeExperience {
  job_title: string;
  company_name: string;
  start_date: string;
  end_date: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone_number: string;
  skills: string;
  education: ResumeEducation;
  projects: ResumeProject[];
  experiences: ResumeExperience[];
}

