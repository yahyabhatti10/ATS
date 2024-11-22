import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

// Props type for the component
interface CandidateProfileModalProps {
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
    candidate: Candidate | null;
}

interface Candidate {
    name: string;
    is_interviewed: boolean;
    is_valid: boolean;
    contact: { email_address: string; phone_number: string }[];
    address: {
        address_line_1: string | null;
        address_line_2: string | null;
        area: string;
        province: string;
        country: string;
        postal_code: string | null;
    }[];
    skills: string[];
    projects: { name: string; description: string }[];
    experiences: { job_title: string; company_name: string | null; start_date: string | null; end_date: string | null }[];
    education: { degree: string; institution: string; start_date: string; end_date: string }[];
}

const toSentenceCase = (name: string | undefined): string => {
    if (!name) return '';
    return name.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

export default function CandidateProfileModal({
    isOpen,
    onClose,
    candidate,
}: CandidateProfileModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{toSentenceCase(candidate?.name)}'s Profile</DialogTitle>
                    <DialogDescription>
                        Detailed information about the candidate
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] mt-4">
                    {candidate && (
                        <div className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-semibold">Personal Information</h3>
                                <p>Name: {candidate.name}</p>
                                <p>Interview Conducted: {candidate.is_interviewed ? 'Yes' : 'No'}</p>
                                <p>Interview Validity: {candidate.is_valid ? 'Yes' : 'No'}</p>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h3 className="text-lg font-semibold">Contact Information</h3>
                                {candidate.contact?.length > 0 ? (
                                    candidate.contact.map((contact, index) => (
                                        <div key={index}>
                                            <p>Email: {contact.email_address}</p>
                                            <p>Phone: {contact.phone_number}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No contact information available</p>
                                )}
                            </div>

                            {/* Address Information */}
                            <div>
                                <h3 className="text-lg font-semibold">Address</h3>
                                {candidate.address?.length > 0 ? (
                                    candidate.address.map((address, index) => (
                                        <div key={index}>
                                            <p>{address.address_line_1}</p>
                                            <p>{address.address_line_2}</p>
                                            <p>{address.area}, {address.province}</p>
                                            <p>{address.country}, {address.postal_code}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No address information available</p>
                                )}
                            </div>

                            {/* Skills Information */}
                            <div>
                                <h3 className="text-lg font-semibold">Skills</h3>
                                <p>{candidate.skills?.length > 0 ? candidate.skills.join(', ') : 'No skills available'}</p>
                            </div>

                            {/* Projects Information */}
                            <div>
                                <h3 className="text-lg font-semibold">Projects</h3>
                                {candidate.projects?.length > 0 ? (
                                    candidate.projects.map((project, index) => (
                                        <div key={index} className="mb-2">
                                            <p className="font-medium">{project.name}</p>
                                            <p>{project.description}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No projects available</p>
                                )}
                            </div>

                            {/* Experience Information */}
                            <div>
                                <h3 className="text-lg font-semibold">Experience</h3>
                                {candidate.experiences?.length > 0 ? (
                                    candidate.experiences.map((experience, index) => (
                                        <div key={index} className="mb-2">
                                            <p className="font-medium">{experience.job_title}</p>
                                            <p>{experience.company_name}</p>
                                            <p>{experience.start_date} - {experience.end_date || 'Present'}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No experience information available</p>
                                )}
                            </div>

                            {/* Education Information */}
                            <div>
                                <h3 className="text-lg font-semibold">Education</h3>
                                {candidate.education?.length > 0 ? (
                                    candidate.education.map((edu, index) => (
                                        <div key={index} className="mb-2">
                                            <p className="font-medium">{edu.degree}</p>
                                            <p>{edu.institution}</p>
                                            <p>{edu.start_date} - {edu.end_date}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No education information available</p>
                                )}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
