'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'

type Job = {
  id: string
  type: 'CAM' | 'Machining'
  part_name: string
  requester: string
  status: string
  est_time: string
  claimed_by: string | null
  created_at: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  display_order: number | null
}

export default function CAMQueue() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string>('user')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }
        setUser(user)
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        
        if (profile?.role) {
            setUserRole(profile.role)
        }

        fetchJobs()
    }
    init()
  }, [router, supabase])

  const fetchJobs = async () => {
    const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 }
    
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('type', 'CAM')
    
    if (jobs) {
        const sortedJobs = jobs.sort((a, b) => {
          if (a.display_order !== null && b.display_order !== null) {
            if (a.display_order !== b.display_order) return a.display_order - b.display_order
          } else if (a.display_order !== null) {
            return -1
          } else if (b.display_order !== null) {
            return 1
          }
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2
          if (aPriority !== bPriority) return aPriority - bPriority
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        
        setJobs(sortedJobs)
    }
  }

  const handleClaim = async (jobId: string) => {
    if (!user) return

    const { error } = await supabase
        .from('jobs')
        .update({ 
            claimed_by: user.id,
            status: 'In Progress'
        })
        .eq('id', jobId)
        .eq('status', 'Pending')

    if (error) {
        toast.error('Failed to claim job: ' + error.message)
    } else {
        toast.success('Job claimed! Head to the Machinist Panel.')
        fetchJobs()
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return

    const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)

    if (error) {
        toast.error('Failed to delete job: ' + error.message)
    } else {
        toast.success('Job deleted successfully.')
        fetchJobs()
    }
  }

  const handlePriorityChange = async (jobId: string, newPriority: string) => {
    const { error } = await supabase
      .from('jobs')
      .update({ priority: newPriority })
      .eq('id', jobId)

    if (error) {
      toast.error('Failed to update priority: ' + error.message)
    } else {
      toast.success('Priority updated')
      fetchJobs()
    }
  }

  const handleMoveUp = async (jobId: string) => {
    const currentIndex = jobs.findIndex(j => j.id === jobId)
    
    if (currentIndex <= 0) return
    const currentJob = jobs[currentIndex]
    const previousJob = jobs[currentIndex - 1]
    
    const updates = [
      supabase.from('jobs').update({ display_order: currentIndex - 1 }).eq('id', currentJob.id),
      supabase.from('jobs').update({ display_order: currentIndex }).eq('id', previousJob.id)
    ]

    await Promise.all(updates)
    fetchJobs()
  }

  const handleMoveDown = async (jobId: string) => {
    const currentIndex = jobs.findIndex(j => j.id === jobId)
    
    if (currentIndex >= jobs.length - 1) return
    const currentJob = jobs[currentIndex]
    const nextJob = jobs[currentIndex + 1]
    
    const updates = [
      supabase.from('jobs').update({ display_order: currentIndex + 1 }).eq('id', currentJob.id),
      supabase.from('jobs').update({ display_order: currentIndex }).eq('id', nextJob.id)
    ]

    await Promise.all(updates)
    fetchJobs()
  }

  const renderActionButtons = (job: Job, index: number, totalJobs: number) => {
    const canDelete = ['machinist', 'designer', 'admin'].includes(userRole)
    const canManagePriority = ['designer', 'admin'].includes(userRole)
    
    return (
        <div className="flex items-center gap-2">
            {job.status === 'Pending' && (
                <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-7 text-xs"
                    onClick={() => handleClaim(job.id)}
                >
                    Claim
                </Button>
            )}
            {job.status === 'In Progress' && (
                <span className="text-xs text-gray-500 italic">Claimed</span>
            )}
            <div className="flex-grow"></div>
            {canManagePriority && (
                <>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 text-xs"
                        onClick={() => handleMoveUp(job.id)}
                        disabled={index === 0}
                    >
                        ↑
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 text-xs"
                        onClick={() => handleMoveDown(job.id)}
                        disabled={index === totalJobs - 1}
                    >
                        ↓
                    </Button>
                </>
            )}
            {canDelete && (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                    onClick={() => handleDelete(job.id)}
                >
                    Delete
                </Button>
            )}
        </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-funky-yellow">CAM Queue</h1>
        <div className="flex items-center gap-4">
            <Link href="/machinist">
                <Button variant="outline" size="sm">My Active Jobs</Button>
            </Link>
        </div>
      </header>

      <section className="space-y-4">
        <Card className="bg-white text-black min-h-[400px] p-0 overflow-hidden">
           <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <span className="font-bold text-lg">Queue</span>
              <Link href="/queue/cam/add">
                  <Button variant="primary" size="sm">Add CAM Job</Button>
              </Link>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                      <tr>
                          <th className="px-4 py-3">Part Name</th>
                          <th className="px-4 py-3">Requester</th>
                          <th className="px-4 py-3">Priority</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Est. Time</th>
                          <th className="px-4 py-3">Action</th>
                      </tr>
                  </thead>
                  <tbody>
                      {jobs.map((job, index) => (
                          <tr key={job.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{job.part_name}</td>
                              <td className="px-4 py-3">{job.requester}</td>
                              <td className="px-4 py-3">
                                  {['designer', 'admin'].includes(userRole) ? (
                                      <select
                                          className="px-2 py-1 rounded text-xs font-semibold border border-gray-300 bg-white"
                                          value={job.priority}
                                          onChange={(e) => handlePriorityChange(job.id, e.target.value)}
                                      >
                                          <option value="Urgent">Urgent</option>
                                          <option value="High">High</option>
                                          <option value="Medium">Medium</option>
                                          <option value="Low">Low</option>
                                      </select>
                                  ) : (
                                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                          ${job.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                                            job.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                            job.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'}`}>
                                          {job.priority}
                                      </span>
                                  )}
                              </td>
                              <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                      ${job.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                        job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                        'bg-yellow-100 text-yellow-800'}`}>
                                      {job.status}
                                  </span>
                              </td>
                              <td className="px-4 py-3">{job.est_time || '-'}</td>
                              <td className="px-4 py-3">
                                  {renderActionButtons(job, index, jobs.length)}
                              </td>
                          </tr>
                      ))}
                      {jobs.length === 0 && (
                          <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                  No CAM jobs in queue.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
           </div>
        </Card>
      </section>
    </div>
  )
}
