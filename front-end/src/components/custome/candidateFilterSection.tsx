import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CandidateFilterProps {
    skillFilter: string;
    setSkillFilter: (value: string) => void;
    interviewedFilter: boolean | null;
    setInterviewedFilter: (value: boolean | null) => void;
    nonInterviewedExpiredFilter: boolean | null;
    setNonInterviewedExpiredFilter: (value: boolean | null) => void;
    pendingInterviewsFilter: boolean | null;
    setPendingInterviewsFilter: (value: boolean | null) => void;
    onApplyFilters: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function CandidateFilterSection({
    skillFilter,
    setSkillFilter,
    interviewedFilter,
    setInterviewedFilter,
    nonInterviewedExpiredFilter,
    setNonInterviewedExpiredFilter,
    pendingInterviewsFilter,
    setPendingInterviewsFilter,
    onApplyFilters,
}: CandidateFilterProps) {
    const handleCheckboxChange = (filterType: 'interviewed' | 'nonInterviewedExpired' | 'pendingInterviews', checked: boolean) => {
        if (filterType === 'interviewed') {
            setInterviewedFilter(checked ? true : null);
            if (checked) {
                setNonInterviewedExpiredFilter(null);
                setPendingInterviewsFilter(null);
            }
        } else if (filterType === 'nonInterviewedExpired') {
            setNonInterviewedExpiredFilter(checked ? true : null);
            if (checked) {
                setInterviewedFilter(null);
                setPendingInterviewsFilter(null);
            }
        } else if (filterType === 'pendingInterviews') {
            setPendingInterviewsFilter(checked ? true : null);
            if (checked) {
                setInterviewedFilter(null);
                setNonInterviewedExpiredFilter(null);
            }
        }
    };

    return (
        <form className="mb-6 space-y-4" onSubmit={onApplyFilters}>
            <div className="flex items-center space-x-4">
                <Input
                    type="text"
                    placeholder="Filter by skill..."
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="max-w-xs"
                />
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="interviewed"
                        checked={interviewedFilter === true}
                        onCheckedChange={(checked) => handleCheckboxChange('interviewed', checked)}
                    />
                    <label htmlFor="interviewed">Interviewed</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="nonInterviewedExpired"
                        checked={nonInterviewedExpiredFilter === true}
                        onCheckedChange={(checked) => handleCheckboxChange('nonInterviewedExpired', checked)}
                    />
                    <label htmlFor="nonInterviewedExpired">Non-interviewed & Expired</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="pendingInterviews"
                        checked={pendingInterviewsFilter === true}
                        onCheckedChange={(checked) => handleCheckboxChange('pendingInterviews', checked)}
                    />
                    <label htmlFor="pendingInterviews">Pending Interviews</label>
                </div>
            </div>
            <Button  type="submit" >Apply Filters</Button>
            {/* onClick={onApplyFilters} */}
        </form>
    )
}
