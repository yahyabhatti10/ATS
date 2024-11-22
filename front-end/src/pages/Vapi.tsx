import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "@/hooks/use-toast"
import { CandidateData } from "@/types/types"
import Vapi from "@vapi-ai/web"
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { validateInterviewLink } from "@/utils/apiCalls"
import { AssistantPrompt } from "@/utils/prompt"

export const vapi = new Vapi("41606d5f-55c1-4bb1-845f-f3786e88dffa")

export default function VapiAssistant() {
    const navigate = useNavigate();
    const { id } = useParams()
    const [callStatus, setCallStatus] = useState("inactive")
    const [candidate, setCandidate] = useState<CandidateData | null>(null)
    const [loading, setLoading] = useState(true)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [isLinkValid, setIsLinkValid] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
        const fetchCandidateData = async () => {
            try {
                const candidateData: CandidateData = await validateInterviewLink(id)
                console.log(candidateData)
                setCandidate(candidateData)
                setIsLinkValid(true)

                toast({
                    title: "Success",
                    description: "Got the candidate info",
                })
            } catch (error) {
                if (error instanceof Error && error.message === "Failed to validate interview link.") {
                    setIsLinkValid(false)
                } else {
                    toast({
                        title: "Error",
                        description: error instanceof Error ? error.message : "An unexpected error occurred.",
                        variant: "destructive",
                    })
                }
            } finally {
                setLoading(false)
            }
        }

        if (!candidate) {
            fetchCandidateData()
        }
    }, [id, candidate])


    const start = async () => {
        setCallStatus("loading")
        const assistantOverrides = {
            variableValues: {
                candidateId: candidate?.candidate_id,
                candidateName: candidate?.name,
                candidatePosition: "Software Engineer",
                candidateProjects: candidate?.projects?.map(p => `Project: ${p.name}, Description: ${p.description}`).join('\n') || 'No projects listed',
                candidateSkills: candidate?.skills?.length ? candidate.skills.join(', ') : 'No skills listed',
                candidateEducation: candidate?.education?.map(e => `${e.degree} from ${e.institution} (${e.start_date} - ${e.end_date})`).join('\n') || 'No education listed',
                candidateContact: candidate?.contact?.[0] ? `Email: ${candidate.contact[0].email_address}, Phone: ${candidate.contact[0].phone_number}` : 'No contact info',
                candidateExperiences: candidate?.experiences?.map(e => `${e.job_title} at ${e.company_name} (${e.start_date} - ${e.end_date})`).join('\n') || 'No experiences listed'
            },
            model: {
                provider: "openai" as const,
                model: "gpt-4o",
                messages: [
                    {
                        role: "system" as "system",
                        content: AssistantPrompt
                    }
                ]
            },
            endCallFunctionEnabled: true
        }

        const response = await vapi.start("63df4d91-d3ab-47d2-95ba-08bf1c0c919d", assistantOverrides)
        console.log(response)

        // Start video stream
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            streamRef.current = stream
            setCallStatus("active");
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (err) {
            console.error("Error accessing media devices:", err)
            toast({
                title: "Error",
                description: "Failed to access camera and microphone",
                variant: "destructive",
            })
        }
    }

    const stop = () => {
        setCallStatus("inactive")
        vapi.stop()
        // Stop video stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
    }

    const toggleMute = () => {
        if (streamRef.current) {
            const audioTracks = streamRef.current.getAudioTracks()
            audioTracks.forEach(track => track.enabled = isMuted)
            setIsMuted(!isMuted)
        }
    }

    const toggleVideo = () => {
        if (streamRef.current) {
            const videoTracks = streamRef.current.getVideoTracks()
            videoTracks.forEach(track => track.enabled = !isVideoEnabled)
            setIsVideoEnabled(!isVideoEnabled)
        }
    }

    useEffect(() => {
        const handleCallStart = () => setCallStatus("active")
        const handleCallEnd = () => {
            setCallStatus('inactive')
            stop()  // Make sure to stop the stream when the call ends
        }

        vapi.on("call-start", handleCallStart)
        vapi.on("call-end", handleCallEnd)

        return () => {
            vapi.removeAllListeners()
            stop()  // Clean up the stream when component unmounts
        }
    }, [])


    if (!isLinkValid) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <h2 className="text-2xl font-bold mb-4">The interview link is not valid</h2>
                <Button onClick={() => navigate('/')}>Go to Home</Button>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="flex w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="w-1/2 bg-gray-900 flex items-center justify-center">
                    {callStatus === "active" ? (
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                        // <CameraFeed isMuted={isMuted} isVideoEnabled={isVideoEnabled} />
                    ) : (
                        <div className="text-white text-center">
                            <Phone className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-xl">Start a call to begin video</p>
                        </div>
                    )}
                </div>
                <div className="w-1/2 p-8">
                    <h2 className="text-3xl font-bold mb-6 text-center">Vapi Assistant</h2>
                    {loading ? (
                        <p className="text-center">Loading candidate data...</p>
                    ) : candidate ? (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage src={candidate.avatar || "/placeholder.svg?height=80&width=80"} alt={candidate.name} />
                                    <AvatarFallback>{candidate.name?.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-2xl font-semibold">{candidate.name}</h3>
                                    <p className="text-gray-500">{candidate.contact?.[0]?.email_address}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold">Skills:</h4>
                                <p>{candidate.skills?.join(', ') || 'No skills listed'}</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold">Experience:</h4>
                                {candidate.experiences?.map((exp, index) => (
                                    <p key={index}>{`${exp.job_title} at ${exp.company_name} (${exp.start_date} - ${exp.end_date})`}</p>
                                )) || <p>No experiences listed</p>}
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold">Education:</h4>
                                {candidate.education?.map((edu, index) => (
                                    <p key={index}>{`${edu.degree} from ${edu.institution} (${edu.start_date} - ${edu.end_date})`}</p>
                                )) || <p>No education listed</p>}
                            </div>
                            {callStatus === "active" && (
                                <div className="text-center">
                                    <p className="text-green-500 font-semibold">Call in progress</p>
                                    <p className="text-sm text-gray-500">Speaking with Elsa</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-center">No candidate data available.</p>
                    )}
                    <div className="mt-8 flex justify-center space-x-4">
                        {callStatus === "inactive" && (
                            <Button onClick={start} className="bg-green-500 hover:bg-green-600">
                                <Phone className="mr-2 h-4 w-4" />
                                Start Call
                            </Button>
                        )}
                        {callStatus === "loading" && (
                            <Button disabled className="bg-yellow-500">
                                <span className="animate-pulse">Connecting...</span>
                            </Button>
                        )}
                        {callStatus === "active" && (
                            <>
                                <Button onClick={stop} variant="destructive">
                                    <PhoneOff className="mr-2 h-4 w-4" />
                                    End Call
                                </Button>
                                <Button onClick={toggleMute} variant="outline">
                                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                </Button>
                                <Button onClick={toggleVideo} variant="outline">
                                    {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}