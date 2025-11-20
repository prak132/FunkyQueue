'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/Card'
import { Activity } from 'lucide-react'

type Job = {
  id: string
  type: 'CAM' | 'Machining'
  part_name: string
  requester: string
  status: string
  claimed_by: string | null
  created_at: string
}

type Profile = {
  id: string
  full_name: string
}

export default function ProgressPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [profiles, setProfiles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name')
    
    if (profilesData) {
      const profileMap: Record<string, string> = {}
      profilesData.forEach(p => {
        profileMap[p.id] = p.full_name
      })
      setProfiles(profileMap)
    }

    if (jobsData) {
      setJobs(jobsData)
    }
    setLoading(false)
  }

  const getClaimerName = (id: string | null) => {
    if (!id) return 'Unclaimed'
    return profiles[id] || 'Unknown User'
  }

  const camJobs = jobs.filter(j => j.type === 'CAM')
  const machiningJobs = jobs.filter(j => j.type === 'Machining')

  if (loading) return <div className="p-8 text-center text-funky-text">Loading progress...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Activity className="text-funky-yellow" size={32} />
        <h1 className="text-3xl font-bold text-funky-yellow">Job Progress</h1>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* CAM Jobs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">CAM Jobs</h2>
          <Card className="bg-white text-black p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">Part Name</th>
                    <th className="px-4 py-3">Requester</th>
                    <th className="px-4 py-3">Claimed By</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {camJobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{job.part_name}</td>
                      <td className="px-4 py-3">{job.requester}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${job.claimed_by ? 'text-blue-600' : 'text-gray-400'}`}>
                          {getClaimerName(job.claimed_by)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                            ${job.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {camJobs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No CAM jobs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Machining Jobs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Machining Jobs</h2>
          <Card className="bg-white text-black p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">Part Name</th>
                    <th className="px-4 py-3">Requester</th>
                    <th className="px-4 py-3">Claimed By</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {machiningJobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{job.part_name}</td>
                      <td className="px-4 py-3">{job.requester}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${job.claimed_by ? 'text-blue-600' : 'text-gray-400'}`}>
                          {getClaimerName(job.claimed_by)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                            ${job.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {machiningJobs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No Machining jobs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
