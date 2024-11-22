import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { getJob, submitApplication } from "@/utils/apiCalls";
import { MapPin, DollarSign, Calendar, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Job {
  job_id: number;
  title: string;
  description: string;
  location: string;
  salary: string;
  date_posted: string;
  is_opened: boolean;
}

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const candidate_id = localStorage.getItem('candidate_id');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await getJob(id);
        setJob(jobData);
        // Check if the application was previously submitted (e.g., from localStorage)
        const isSubmitted = localStorage.getItem(`application_${id}_${candidate_id}`);
        if (isSubmitted === 'true') {
          setSubmitted(true);
        }
      } catch (error) {
        setError("Failed to load job.");
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id, candidate_id]);

  const handleApply = async () => {
    if (!job) return;

    setLoading(true);
    try {
      await submitApplication(job.job_id, candidate_id);
      setSubmitted(true);
      // Store the submission state in localStorage
      localStorage.setItem(`application_${id}_${candidate_id}`, 'true');
      toast({
        title: "Success",
        description: "Application submitted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!job) {
    return <p>Loading job details...</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Listings
      </Button>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-start">
            <span className="text-2xl font-bold">{job.title}</span>
            <Badge variant={job.is_opened ? "default" : "secondary"}>
              {job.is_opened ? "Open" : "Closed"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <p className="text-gray-600 mb-6 leading-relaxed">{job.description}</p>
          </ScrollArea>
          <div className="space-y-4 mt-6">
            <div className="flex items-center text-gray-700">
              <MapPin className="mr-2" size={20} />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <DollarSign className="mr-2" size={20} />
              <span>{job.salary}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Calendar className="mr-2" size={20} />
              <span>{new Date(job.date_posted).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={!job.is_opened || loading || submitted}
            onClick={handleApply}
          >
            {loading ? "Submitting..." :
              submitted ? "Submitted" :
                job.is_opened ? "Apply Now" : "Position Filled"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}