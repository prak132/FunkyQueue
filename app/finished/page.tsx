'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'
import Image from 'next/image'

import { Job } from '@/types'

type FinishedJob = Job & {
  profiles: { full_name: string | null } | null
}

export default function FinishedJobs() {
  const [jobs, setJobs] = useState<FinishedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<FinishedJob | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchFinishedJobs()
  }, [])

  const fetchFinishedJobs = async () => {
    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'Completed')
      .order('completed_at', { ascending: false })
    
    if (jobsData) {
        const userIds = Array.from(new Set(jobsData.map(j => j.claimed_by).filter(Boolean)))
        let profilesMap: Record<string, string> = {}
        if (userIds.length > 0) {
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', userIds)
            
            if (profilesData) {
                profilesData.forEach(p => {
                    profilesMap[p.id] = p.full_name || 'Unknown'
                })
            }
        }

        const jobsWithProfiles = jobsData.map(job => ({
            ...job,
            profiles: {
                full_name: job.claimed_by ? profilesMap[job.claimed_by] : 'Unknown'
            }
        }))
        
        setJobs(jobsWithProfiles as any)
    }
    setLoading(false)
  }

  if (loading) return <div className="p-8 text-center text-funky-text">Loading finished jobs...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-funky-yellow">Finished Jobs</h1>

      {jobs.length === 0 ? (
        <div className="text-center py-12 text-funky-text-dim">
          No finished jobs yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card 
                key={job.id} 
                className="cursor-pointer hover:border-funky-yellow transition-colors group"
                onClick={() => setSelectedJob(job)}
            >
                <div className="space-y-2">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-white group-hover:text-funky-yellow transition-colors">{job.part_name}</h3>
                        <span className="text-xs text-funky-text-dim bg-funky-dark px-2 py-1 rounded">
                            {job.type}
                        </span>
                    </div>
                    <p className="text-sm text-funky-text-dim">Requested by <span className="text-white">{job.requester}</span></p>
                    <p className="text-xs text-funky-text-dim">
                        Completed: {job.completed_at ? new Date(job.completed_at).toLocaleString() : 'Date unknown'}
                    </p>
                </div>
            </Card>
          ))}
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
            <div className="bg-funky-black border border-funky-dark rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 relative" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setSelectedJob(null)}
                    className="absolute top-4 right-4 text-funky-text-dim hover:text-white"
                >
                    <X size={24} />
                </button>

                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-funky-yellow">{selectedJob.part_name}</h2>
                    <p className="text-funky-text-dim">
                        Completed by <span className="text-white font-medium">{selectedJob.profiles?.full_name || 'Unknown'}</span> on {selectedJob.completed_at ? new Date(selectedJob.completed_at).toLocaleString() : 'Date unknown'}
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-funky-text-dim block">Requester</span>
                            <span className="text-white font-medium">{selectedJob.requester}</span>
                        </div>
                        <div>
                            <span className="text-funky-text-dim block">Type</span>
                            <span className="text-white font-medium">{selectedJob.type}</span>
                        </div>
                    </div>

                    {selectedJob.completion_image_url ? (
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-funky-dark border border-funky-dark">
                            <Image 
                                src={selectedJob.completion_image_url} 
                                alt={`Finished part: ${selectedJob.part_name}`}
                                fill
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <div className="aspect-video w-full rounded-lg bg-funky-dark flex items-center justify-center text-funky-text-dim italic">
                            No completion image available
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
