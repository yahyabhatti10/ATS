import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Candidate } from "@/types/candidateTypes";

// Props type for the component
interface InterviewProfileModalProps {
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
    candidate: Candidate | null;  // Changed to Interview type
}

interface Interview {
    start_time: string; // Use string to handle date format
    end_time: string;   // Use string to handle date format
    duration: number;   // Duration in seconds
    transcript: string;
    summary: string;
    recording_url: string;
    video_recording_url: string;
    success_evaluation: number;
}

export default function InterviewProfileModal({
    isOpen,
    onClose,
    candidate,  // Access the interview prop directly
}: InterviewProfileModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Interview Profile</DialogTitle>
                    <DialogDescription>
                        Detailed information about the interview
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] mt-4">
                    {candidate?.interviews.map(interview=>(
                        <div className="space-y-6">
                        {/* Interview Information */}
                        <div>
                            <h3 className="text-lg font-semibold">Interview Details</h3>
                            <p>Start Time: {new Date(interview.start_time).toLocaleString()}</p>
                            <p>End Time: {new Date(interview.end_time).toLocaleString()}</p>
                            <p>Duration: {interview.duration} seconds</p>
                            <p>Success Evaluation: {interview.success_evaluation}</p>
                        </div>

                        {/* Transcript */}
                        <div>
                            <h3 className="text-lg font-semibold">Transcript</h3>
                            <p>{interview.transcript || 'No transcript available'}</p>
                        </div>

                        {/* Summary */}
                        <div>
                            <h3 className="text-lg font-semibold">Summary</h3>
                            <p>{interview.summary || 'No summary available'}</p>
                        </div>

                        {/* Recording URL */}
                        <div>
                            <h3 className="text-lg font-semibold">Recording</h3>
                            {interview.recording_url ? (
                                <a href={interview.recording_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                    Click here to view recording
                                </a>
                            ) : (
                                <p>No recording available</p>
                            )}
                        </div>

                        {/* Video Recording URL */}
                        <div>
                            <h3 className="text-lg font-semibold">Video Recording</h3>
                            {interview.video_recording_url ? (
                                <a href={interview.video_recording_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                    Click here to view video recording
                                </a>
                            ) : (
                                <p>No video recording available</p>
                            )}
                        </div>
                    </div>
                    )) && (  // Use the interview prop directly
                        <h1>No interviews</h1>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
