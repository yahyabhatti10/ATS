import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"

import { Candidate } from '../../types/candidateTypes';

interface CandidateTableProps {
    candidates: Candidate[];
    sortColumn: keyof Candidate;
    sortDirection: 'asc' | 'desc';
    onSort: (column: keyof Candidate) => void;
    onViewProfile: (candidate: Candidate) => void;
    onViewInterviewDetails: (candidate: Candidate) => void;
}

const toSentenceCase = (name: string | undefined): string => {
    if (!name) return '';
    return name.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

const SortIcon = ({ column, sortColumn, sortDirection }: { column: keyof Candidate, sortColumn: keyof Candidate, sortDirection: 'asc' | 'desc' }) => {
    if (column !== sortColumn) return null;
    return sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />;
};

export default function CandidateTable({ candidates, sortColumn, sortDirection, onSort, onViewProfile, onViewInterviewDetails }: CandidateTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse table-auto">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 text-left cursor-pointer" onClick={() => onSort('name')}>
                            Name <SortIcon column="name" sortColumn={sortColumn} sortDirection={sortDirection} />
                        </th>
                        <th className="p-2 text-left">Email Address</th>
                        <th className="p-2 text-left cursor-pointer" onClick={() => onSort('is_interviewed')}>
                            Interview Status <SortIcon column="is_interviewed" sortColumn={sortColumn} sortDirection={sortDirection} />
                        </th>
                        <th className="p-2 text-left cursor-pointer" onClick={() => onSort('is_valid')}>
                            Interview Validity <SortIcon column="is_valid" sortColumn={sortColumn} sortDirection={sortDirection} />
                        </th>
                        <th className="p-2 text-left">Profile</th>
                        <th className="p-2 text-left">Interview Details</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map((candidate) => (
                        <tr key={candidate.candidate_id} className="border-b">
                            <td className="p-2">{toSentenceCase(candidate.name)}</td>
                            <td className="p-2">{candidate.contact[0]?.email_address || 'No email available'}</td>
                            <td className="p-2">{candidate.is_interviewed ? 'Interviewed' : 'Not Interviewed'}</td>
                            <td className="p-2">{candidate.is_valid ? 'To be interviewed' : 'Cannot take interview'}</td>
                            <td className="p-2">
                                <Button onClick={() => onViewProfile(candidate)}>View Profile</Button>
                            </td>
                            <td className="p-2">
                                <Button onClick={() => onViewInterviewDetails(candidate)}>Show</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
