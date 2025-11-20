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
}

export default function Home() {
  const [camJobs, setCamJobs] = useState<Job[]>([])
  const [machiningJobs, setMachiningJobs] = useState<Job[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
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
        
        // Check approval status
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_approved')
            .eq('id', user.id)
            .single()
        
        if (profile) {
            setIsApproved(profile.is_approved)
            if (profile.is_approved) {
                fetchJobs()
            }
        }
    }
    init()
  }, [router, supabase])

  const fetchJobs = async () => {
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
    
    if (jobs) {
        setCamJobs(jobs.filter(j => j.type === 'CAM'))
        setMachiningJobs(jobs.filter(j => j.type === 'Machining'))
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
        .eq('status', 'Pending') // Safety check

    if (error) {
        toast.error('Failed to claim job: ' + error.message)
    } else {
        toast.success('Job claimed! Head to the Machinist Panel.')
        fetchJobs()
    }
  }

  if (isApproved === false) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center space-y-6 border-yellow-500/50 bg-yellow-500/10">
                <div className="text-6xl">⏳</div>
                <h1 className="text-2xl font-bold text-funky-yellow">Account Pending Approval</h1>
                <p className="text-funky-text-dim">
                    Your account has been created but is waiting for admin approval. 
                    Please contact an administrator or check back later.
                </p>
                <Button variant="outline" onClick={() => router.push('/login')}>Back to Login</Button>
            </Card>
        </div>
      )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-funky-yellow">FRC Machining Queue</h1>
        <div className="flex items-center gap-4">
            <Link href="/machinist">
                <Button variant="outline" size="sm">My Active Jobs</Button>
            </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CAM Queue */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">CAM Queue</h2>
          </div>
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
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Est. Time</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {camJobs.map((job) => (
                            <tr key={job.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{job.part_name}</td>
                                <td className="px-4 py-3">{job.requester}</td>
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
                                </td>
                            </tr>
                        ))}
                        {camJobs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    No CAM jobs in queue.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
          </Card>
        </section>

        {/* Machining Queue */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Machining Queue</h2>
          </div>
          <Card className="bg-white text-black min-h-[400px] p-0 overflow-hidden">
             <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <span className="font-bold text-lg">Queue</span>
                <Link href="/queue/machining/add">
                    <Button variant="primary" size="sm">Add Machining Job</Button>
                </Link>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th className="px-4 py-3">Part Name</th>
                            <th className="px-4 py-3">Requester</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Est. Time</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {machiningJobs.map((job) => (
                            <tr key={job.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{job.part_name}</td>
                                <td className="px-4 py-3">{job.requester}</td>
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
                                </td>
                            </tr>
                        ))}
                        {machiningJobs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    No Machining jobs in queue.
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
