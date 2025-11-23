'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusSquare, Settings, CheckCircle, Activity, Clock } from 'lucide-react'

import { Job } from '@/types'

export default function Dashboard() {
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [stats, setStats] = useState({
    activeJobs: 0,
    completedToday: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }
        fetchDashboardData()
    }
    init()
  }, [router, supabase])

  const fetchDashboardData = async () => {
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
    
    if (jobs) setRecentJobs(jobs)

    const { count: activeCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Pending', 'In Progress'])
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: completedCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Completed')
        .gte('completed_at', today.toISOString())

    setStats({
        activeJobs: activeCount || 0,
        completedToday: completedCount || 0
    })
    setLoading(false)
  }

  if (loading) return <div className="p-8 text-center text-funky-text">Loading dashboard...</div>

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-80px)]">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-funky-yellow">Dashboard</h1>
        <p className="text-funky-text-dim">Welcome back to FunkyQueue.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 flex-grow content-start">
        <Card className="md:col-span-2 bg-funky-dark/50 border-funky-dark p-4 md:p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="text-funky-yellow" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                <Link href="/queue/machining/add" className="contents">
                    <Button variant="outline" className="h-20 md:h-24 flex flex-col gap-2 hover:bg-funky-yellow hover:text-black transition-all cursor-pointer">
                        <PlusSquare size={24} />
                        <span className="text-xs md:text-sm">Add Machining</span>
                    </Button>
                </Link>
                <Link href="/queue/cam/add" className="contents">
                    <Button variant="outline" className="h-20 md:h-24 flex flex-col gap-2 hover:bg-funky-yellow hover:text-black transition-all cursor-pointer">
                        <PlusSquare size={24} />
                        <span className="text-xs md:text-sm">Add CAM</span>
                    </Button>
                </Link>
                <Link href="/machinist" className="contents">
                    <Button variant="outline" className="h-20 md:h-24 flex flex-col gap-2 hover:bg-funky-yellow hover:text-black transition-all cursor-pointer">
                        <Settings size={24} />
                        <span className="text-xs md:text-sm">My Jobs</span>
                    </Button>
                </Link>
                <Link href="/finished" className="contents">
                    <Button variant="outline" className="h-20 md:h-24 flex flex-col gap-2 hover:bg-funky-yellow hover:text-black transition-all cursor-pointer">
                        <CheckCircle size={24} />
                        <span className="text-xs md:text-sm">Finished</span>
                    </Button>
                </Link>
            </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-4 md:gap-6">
            <Card className="bg-blue-900/20 border-blue-900/50 p-4 md:p-6 flex flex-col justify-center items-center hover:bg-blue-900/30 transition-colors cursor-pointer">
                <span className="text-3xl md:text-4xl font-bold text-blue-400">{stats.activeJobs}</span>
                <span className="text-xs md:text-sm text-blue-200 uppercase tracking-wider font-semibold mt-1 text-center">Active Jobs</span>
            </Card>
            <Card className="bg-green-900/20 border-green-900/50 p-4 md:p-6 flex flex-col justify-center items-center hover:bg-green-900/30 transition-colors cursor-pointer">
                <span className="text-3xl md:text-4xl font-bold text-green-400">{stats.completedToday}</span>
                <span className="text-xs md:text-sm text-green-200 uppercase tracking-wider font-semibold mt-1 text-center">Completed Today</span>
            </Card>
        </div>

        <Card className="md:col-span-3 bg-funky-dark/30 border-funky-dark p-4 md:p-6 flex-grow md:flex-grow-0">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="text-funky-yellow" /> Recently Added
                </h2>
                <Link href="/machining">
                    <Button variant="ghost" size="sm" className="text-funky-text-dim hover:text-white cursor-pointer">View All</Button>
                </Link>
            </div>
            
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-funky-text-dim uppercase bg-funky-dark/50">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Type</th>
                            <th className="px-4 py-3">Part Name</th>
                            <th className="px-4 py-3">Requester</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 rounded-r-lg">Added</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentJobs.map((job) => (
                            <tr key={job.id} className="border-b border-funky-dark/50 hover:bg-funky-dark/30 transition-colors cursor-pointer">
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${job.type === 'CAM' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                                        {job.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-white">{job.part_name}</td>
                                <td className="px-4 py-3 text-funky-text-dim">{job.requester}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                        ${job.status === 'Completed' ? 'bg-green-900/30 text-green-400' : 
                                          job.status === 'In Progress' ? 'bg-blue-900/30 text-blue-400' : 
                                          'bg-yellow-900/30 text-yellow-400'}`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-funky-text-dim">
                                    {new Date(job.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden space-y-3">
                {recentJobs.map((job) => (
                    <div key={job.id} className="bg-funky-dark/40 p-3 rounded-lg border border-funky-dark/50 flex flex-col gap-2 cursor-pointer active:bg-funky-dark/60 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mb-1 inline-block ${job.type === 'CAM' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                                    {job.type}
                                </span>
                                <h3 className="font-bold text-white text-sm">{job.part_name}</h3>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold 
                                ${job.status === 'Completed' ? 'bg-green-900/30 text-green-400' : 
                                  job.status === 'In Progress' ? 'bg-blue-900/30 text-blue-400' : 
                                  'bg-yellow-900/30 text-yellow-400'}`}>
                                {job.status}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs text-funky-text-dim">
                            <span>{job.requester}</span>
                            <span>{new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      </div>
    </div>
  )
}
