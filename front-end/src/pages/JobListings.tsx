import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, DollarSign, Calendar, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getJobs } from "@/utils/apiCalls"

interface Job {
  job_id: number
  title: string
  description: string
  location: string
  salary: string
  date_posted: string
  is_opened: boolean
}

export default function JobListings() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showOpenOnly, setShowOpenOnly] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Fetch jobs with pagination
        const response = await getJobs(page)
        console.log(response)
        setJobs(response.jobs)
        setTotalPages(response.total_pages)
        setPageSize(response.page_size)
        setLoading(false)
      } catch (error) {
        setError("Failed to load jobs.")
        setLoading(false)
      }
    }

    fetchJobs()
  }, [page, searchTerm, showOpenOnly]) // Fetch jobs when page, search term, or filter changes

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!showOpenOnly || job.is_opened)
  )

  const handleJobSelect = (job: Job) => {
    navigate(`/jobs/${job.job_id}`)
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  if (loading) {
    return <div>Loading jobs...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Job Listings</h1>
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="open-jobs"
            checked={showOpenOnly}
            onCheckedChange={() => setShowOpenOnly(!showOpenOnly)}
          />
          <Label htmlFor="open-jobs">Show open jobs only</Label>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredJobs.map((job) => (
            <motion.div
              key={job.job_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => handleJobSelect(job)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{job.title}</span>
                    <Badge variant={job.is_opened ? "default" : "secondary"}>
                      {job.is_opened ? "Open" : "Closed"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{job.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2" size={16} />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="mr-2" size={16} />
                      {job.salary}
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2" size={16} />
                      {new Date(job.date_posted).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-8">
        <button
          disabled={page === 1}
          onClick={handlePreviousPage}
          className={`px-4 py-2 ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'}`}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={handleNextPage}
          className={`px-4 py-2 ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'}`}
        >
          Next
        </button>
      </div>
    </div>
  )
}
