"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { retrieveResume, submitResume, uploadResume } from "@/utils/apiCalls"
import { extractFileName } from "@/utils/extractNames"
import { ResumeData, ResumeEducation, ResumeExperience, ResumeProject } from "@/types/types"
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useNavigate } from 'react-router-dom';


const parseResume = async (file: File): Promise<any> => {
  try {
    const uploadData = await uploadResume(file);
    const filename = extractFileName(uploadData.info);
    const parsedResume = await retrieveResume(filename);
    console.log(parsedResume)
    return parsedResume;
  } catch (error) {
    console.error("Error in API call:", error);
    throw error;
  }
}

export default function ResumeParser() {
  const navigate = useNavigate();  // Initialize the navigate function

  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [parsedData, setParsedData] = useState<ResumeData | null>({
    name: '',
    email: '',
    phone_number: '',
    skills: '',
    education: {
      degree: '',
      institution: '',
      start_date: '',
      end_date: ''
    },
    projects: [],
    experiences: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }, [])

  const handleUpload = useCallback(async () => {
    if (!file) return

    setIsUploading(true)
    try {
      const data = await parseResume(file);
      console.log(data)
      if (Object.keys(data).length === 0) {
        console.log("The data object is empty.");
      } else {
        console.log("The data object has content:", data);
        setParsedData(data);
      }
    } catch (error) {
      console.error("Error parsing resume:", error)
      toast({
        title: "Error",
        description: "There was an error parsing resume.Please try again.",
      });
    } finally {
      setIsUploading(false)
    }
  }, [file])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof ResumeData) => {
    if (parsedData) {
      setParsedData(prev => ({
        ...prev,
        [field]: e.target.value
      }) as ResumeData);
    }
  }

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ResumeEducation) => {
    if (parsedData) {
      setParsedData(prev => ({
        ...prev,
        education: { ...prev?.education, [field]: e.target.value }
      }) as ResumeData);
    }
  }

  const handleProjectChange = (index: number, field: keyof ResumeProject, value: string) => {
    if (parsedData) {
      setParsedData(prev => ({
        ...prev,
        projects: prev?.projects.map((project, i) =>
          i === index ? { ...project, [field]: value } : project
        )
      }) as ResumeData);
    }
  }

  const handleExperienceChange = (index: number, field: keyof ResumeExperience, value: string) => {
    if (parsedData) {
      setParsedData(prev => ({
        ...prev,
        experiences: prev?.experiences.map((exp, i) =>
          i === index ? { ...exp, [field]: value } : exp
        )
      }) as ResumeData);
    }
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    console.log("Submitted data:", parsedData)
    try {
      const data = await submitResume(parsedData);
      localStorage.setItem('candidate_id', data.candidate_id);
      console.log(data.candidate_id);
      navigate("/jobs");
    } catch (error) {
      console.error("Error submitting resume or scheduling interview:", error)
    } finally {
      setIsSubmitting(false)
    }
  }, [parsedData])
  return (
    <>
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Resume Parser</CardTitle>
            <CardDescription>Upload your resume to parse its content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="resume">Upload Resume</Label>
                <Input id="resume" type="file" accept=".pdf" onChange={handleFileChange} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? "Processing..." : "Upload and Parse"}
            </Button>
          </CardFooter>
        </Card>

        {parsedData && (
          <form onSubmit={handleSubmit}>
            <Card className="w-full max-w-2xl mx-auto mt-4">
              <CardHeader>
                <CardTitle>Parsed Resume Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="name" className="text-lg font-semibold">Name</Label>
                    <Input
                      id="name"
                      value={parsedData?.name}
                      onChange={(e) => handleChange(e, 'name')}
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="email" className="text-lg font-semibold">Email</Label>
                    <Input
                      id="email"
                      value={parsedData?.email}
                      onChange={(e) => handleChange(e, 'email')}
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="phone_number" className="text-lg font-semibold">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={parsedData?.phone_number}
                      onChange={(e) => handleChange(e, 'phone_number')}
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="skills" className="text-lg font-semibold">Skills</Label>
                    <Textarea
                      id="skills"
                      value={parsedData?.skills}
                      onChange={(e) => handleChange(e, 'skills')}
                      className="h-40 text-lg"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label className="text-lg font-semibold">Education</Label>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="degree" className="text-md">Degree</Label>
                        <Input
                          id="degree"
                          placeholder="Degree"
                          value={parsedData.education?.degree}
                          onChange={(e) => handleEducationChange(e, 'degree')}
                          className="h-12 text-lg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="institution" className="text-md">Institution</Label>
                        <Input
                          id="institution"
                          placeholder="Institution"
                          value={parsedData.education?.institution}
                          onChange={(e) => handleEducationChange(e, 'institution')}
                          className="h-12 text-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edu_start_date" className="text-md">Start Date</Label>
                          <Input
                            id="edu_start_date"
                            placeholder="Start Date"
                            value={parsedData.education?.start_date}
                            onChange={(e) => handleEducationChange(e, 'start_date')}
                            className="h-12 text-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edu_end_date" className="text-md">End Date</Label>
                          <Input
                            id="edu_end_date"
                            placeholder="End Date"
                            value={parsedData.education?.end_date}
                            onChange={(e) => handleEducationChange(e, 'end_date')}
                            className="h-12 text-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label className="text-lg font-semibold">Projects</Label>
                    {parsedData.projects?.map((project, index) => (
                      <div key={index} className="border p-4 rounded space-y-4">
                        <div>
                          <Label htmlFor={`project_name_${index}`} className="text-md">Project Name</Label>
                          <Input
                            id={`project_name_${index}`}
                            placeholder="Project Name"
                            value={project.name}
                            onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                            className="h-12 text-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`project_description_${index}`} className="text-md">Project Description</Label>
                          <Textarea
                            id={`project_description_${index}`}
                            placeholder="Project Description"
                            value={project.description}
                            onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                            className="h-32 text-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label className="text-lg font-semibold">Experiences</Label>
                    {parsedData.experiences?.map((experience, index) => (
                      <div key={index} className="border p-4 rounded space-y-4">
                        <div>
                          <Label htmlFor={`job_title_${index}`} className="text-md">Position</Label>
                          <Input
                            id={`job_title_${index}`}
                            placeholder="Job Title"
                            value={experience.job_title}
                            onChange={(e) => handleExperienceChange(index, 'job_title', e.target.value)}
                            className="h-12 text-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`company_name_${index}`} className="text-md">Company Name</Label>
                          <Input
                            id={`company_name_${index}`}
                            placeholder="Company Name"
                            value={experience.company_name}
                            onChange={(e) => handleExperienceChange(index, 'company_name', e.target.value)}
                            className="h-12 text-lg"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`start_date_${index}`} className="text-md">Start Date</Label>
                            <Input
                              id={`start_date_${index}`}
                              placeholder="Start Date"
                              value={experience.start_date}
                              onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                              className="h-12 text-lg"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`end_date_${index}`} className="text-md">End Date</Label>
                            <Input
                              id={`end_date_${index}`}
                              placeholder="End Date"
                              value={experience.end_date}
                              onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                              className="h-12 text-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </>
  )
}