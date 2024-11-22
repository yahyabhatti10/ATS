'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

import CandidateFilterSection from '../components/custome/candidateFilterSection';
import CandidateTable from '../components/custome/candidateTable';
import CandidateProfileModal from '../components/custome/candidateProfile';
import InterviewProfileModal from '@/components/custome/interviewProfile';

import { Candidate } from '../../src/types/candidateTypes';

export default function AdminDashboard() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<keyof Candidate>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShowInterview, setIsShowInterview] = useState(false);
    const [skillFilter, setSkillFilter] = useState('');
    const [interviewedFilter, setInterviewedFilter] = useState<boolean | null>(null);
    const [nonInterviewedExpiredFilter, setNonInterviewedExpiredFilter] = useState<boolean | null>(null);
    const [pendingInterviewsFilter, setPendingInterviewsFilter] = useState<boolean | null>(null);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate(); 

    useEffect(() => {
        const skill = searchParams.get('skill');
        const interviewed = searchParams.get('interviewed');
        const nonInterviewedExpired = searchParams.get('non_interviewed_expired');
        const pendingInterviews = searchParams.get('pending_interviews');

        setSkillFilter(skill || '');
        setInterviewedFilter(interviewed === 'true' ? true : interviewed === 'false' ? false : null);
        setNonInterviewedExpiredFilter(nonInterviewedExpired === 'true' ? true : null);
        setPendingInterviewsFilter(pendingInterviews === 'true' ? true : null);

        fetchCandidates();
    }, [searchParams]);

    const fetchCandidates = async (queryParams = new URLSearchParams()) => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.error('No access token found');
            navigate('/login-admin');
            setError('No access token found. Please log in again.');
            setLoading(false);
            return;
        }
        
        setError(null);
        
        try {
            let endpoint = `http://127.0.0.1:8000/api/v1/admin-dashboard`;

            if (queryParams.toString()) {
                endpoint = `http://127.0.0.1:8000/api/v1/admin-dashboard/filters?${queryParams.toString()}`;
            }

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 403) {
                setError('Access Denied. You are not authorized to access this resource.');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch candidates');
            }

            const data = await response.json();
            setCandidates(data.candidates);
        } catch (err) {
            console.error(err);
            setError('An error occurred while fetching candidates. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login-admin');
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSort = (column: keyof Candidate) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleViewProfile = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setIsModalOpen(true);
    };

    const handleViewInterview = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setIsShowInterview(true);
    };

    const handleApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const queryParams = new URLSearchParams();

        if (skillFilter) queryParams.append('skill', skillFilter);
        if (interviewedFilter !== null) queryParams.append('interviewed', interviewedFilter.toString());
        if (nonInterviewedExpiredFilter !== null) queryParams.append('non_interviewed_expired', nonInterviewedExpiredFilter.toString());
        if (pendingInterviewsFilter !== null) queryParams.append('pending_interviews', pendingInterviewsFilter.toString());

        fetchCandidates(queryParams);
    };

    const filteredCandidates = candidates.filter((candidate) =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.contact[0]?.email_address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedCandidates = [...filteredCandidates].sort((a, b) => {
        const valueA = a[sortColumn] ?? '';
        const valueB = b[sortColumn] ?? '';
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const skillsCount = candidates.reduce((acc, candidate) => {
        candidate.skills.forEach(skill => {
            acc[skill] = (acc[skill] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const topSkills = Object.entries(skillsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));

    const interviewStatus = [
        { name: 'Interviewed', value: candidates.filter(c => c.is_interviewed).length },
        { name: 'Not Interviewed', value: candidates.filter(c => !c.is_interviewed).length }
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 relative">
            <div className="absolute top-4 right-4">
                <Button onClick={() => handleLogout()}>
                    Logout
                </Button>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">AI Interviewer Admin Dashboard</h1>
            <p className="text-xl mb-6">Total Candidates: {candidates.length}</p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Top 10 Skills</CardTitle>
                        <CardDescription>Distribution of skills among candidates</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ChartContainer config={{
                            skills: {
                                label: "Skills",
                                color: "hsl(var(--chart-1))",
                            },
                        }} className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topSkills}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="value" fill="var(--color-skills)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Interview Status</CardTitle>
                        <CardDescription>Proportion of interviewed candidates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{
                            status: {
                                label: "Status",
                                color: "hsl(var(--chart-2))",
                            },
                        }} className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={interviewStatus}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {interviewStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <CandidateFilterSection
                skillFilter={skillFilter}
                setSkillFilter={setSkillFilter}
                interviewedFilter={interviewedFilter}
                setInterviewedFilter={setInterviewedFilter}
                nonInterviewedExpiredFilter={nonInterviewedExpiredFilter}
                setNonInterviewedExpiredFilter={setNonInterviewedExpiredFilter}
                pendingInterviewsFilter={pendingInterviewsFilter}
                setPendingInterviewsFilter={setPendingInterviewsFilter}
                onApplyFilters={handleApplyFilters}
            />

            <div className="mb-4 relative">
                <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full p-2 pl-10 border rounded-md"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            <CandidateTable
                candidates={sortedCandidates}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                onViewProfile={handleViewProfile}
                onViewInterviewDetails={handleViewInterview}
            />

            <CandidateProfileModal
                isOpen={isModalOpen}
                onClose={setIsModalOpen}
                candidate={selectedCandidate}
            />
            <InterviewProfileModal
                isOpen={isShowInterview}
                onClose={setIsShowInterview}
                candidate={selectedCandidate}
            />
        </div>
    );
}