import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Briefcase, CheckCircle, Video, PieChart, Users } from 'lucide-react'
import { Link } from 'react-router-dom';


export default function Landing() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const scrollToSection = (sectionId: string) => {
        const section = document.getElementById(sectionId)
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const features = [
        { Icon: FileText, title: "Resume Parsing", description: "Automatically extract and analyze key information from resumes.", id: "resume-parsing" },
        { Icon: Briefcase, title: "Job Listing", description: "Post and manage job openings with ease.", id: "job-listing" },
        { Icon: CheckCircle, title: "ATS Checking", description: "Ensure resumes are optimized for Applicant Tracking Systems.", id: "ats-checking" },
        { Icon: Video, title: "Online AI Interview", description: "Conduct AI-powered video interviews for initial screening.", id: "ai-interview" },
        { Icon: PieChart, title: "Evaluation Score", description: "Get comprehensive candidate scores based on multiple factors.", id: "evaluation-score" },
        { Icon: Users, title: "Candidate Matching", description: "Find the best candidates for each job using AI matching algorithms.", id: "candidate-matching" },
    ]

    return (
        <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
            {/* Animated background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 animate-gradient-x"></div>
                <div className="absolute inset-0 opacity-50">
                    <div className="absolute inset-0 bg-[url('')] animate-pulse"></div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 bg-opacity-90 shadow-lg backdrop-blur-md">
                <div className="container mx-auto px-6 py-4">
                    <ul className="flex justify-center space-x-6">
                        {features.map((feature) => (
                            <li key={feature.id}>
                                <Button
                                    variant="ghost"
                                    onClick={() => scrollToSection(feature.id)}
                                    className="text-sm hover:text-blue-400 transition-colors"
                                >
                                    {feature.title}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            <div className="relative z-10 container mx-auto px-6 py-24">
                <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-gradient-x">
                        Revolutionize Your Hiring with AI-Powered Interviews
                    </h1>
                    <p className="text-xl mb-8 text-gray-300">
                        Experience the future of recruitment with our cutting-edge AI interview platform. Streamline your hiring process and find the perfect candidates effortlessly.
                    </p>

                    <Button className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse">
                        <Link to="/upload-resume">  Get Started</Link> <ArrowRight className="ml-2" />
                    </Button>
                </div>

                {features.map((feature, index) => (
                    <div
                        key={feature.id}
                        id={feature.id}
                        className={`mt-32 flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                        <div className={`w-1/2 px-8 transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 ' + (index % 2 === 0 ? '-translate-x-full' : 'translate-x-full')}`}>
                            <feature.Icon className="w-24 h-24 mb-6 text-blue-400 animate-float" />
                            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-gradient-x">{feature.title}</h2>
                            <p className="text-xl text-gray-300 mb-6">{feature.description}</p>
                            <Button variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white transition-colors animate-pulse">
                                Learn More
                            </Button>
                        </div>
                        <div className={`w-1/2 px-8 transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 ' + (index % 2 === 0 ? 'translate-x-full' : '-translate-x-full')}`}>
                            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-lg backdrop-blur-md hover:shadow-2xl transition-shadow duration-300">
                                <div className="aspect-w-16 aspect-h-9 relative overflow-hidden rounded-lg">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 animate-gradient-x"></div>
                                    <img
                                        src={`/placeholder.svg?height=300&width=400`}
                                        alt={`${feature.title} illustration`}
                                        className="object-cover rounded-lg mix-blend-overlay"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <footer className="relative z-10 bg-gray-900 bg-opacity-90 text-white py-8 mt-32 backdrop-blur-md">
                <div className="container mx-auto px-6 text-center">
                    <p>&copy; {new Date().getFullYear()} AI Interview Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}