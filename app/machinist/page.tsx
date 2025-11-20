'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { FileText, CheckCircle, XCircle, Clock, Upload } from 'lucide-react'

type Job = {
  id: string
  type: 'CAM' | 'Machining'
  part_name: string
  requester: string
  description: string
  status: string
  est_time: string
  g_code_url?: string
  drawing_url?: string
  created_at: string
}

export default function MachinistPanel() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [completingJobId, setCompletingJobId] = useState<string | null>(null)
  const [completionFile, setCompletionFile] = useState<File | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchMyJobs()
  }, [])

  const fetchMyJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        router.push('/login')
        return
    }

    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('claimed_by', user.id)
      .neq('status', 'Completed')
      .order('created_at', { ascending: true })
    
    if (data) setJobs(data)
    setLoading(false)
  }

  const handleUnclaim = async (jobId: string) => {
    const { error } = await supabase
        .from('jobs')
        .update({ claimed_by: null, status: 'Pending' })
        .eq('id', jobId)
    
    if (error) {
        toast.error('Failed to unclaim job')
    } else {
        toast.success('Job unclaimed')
        fetchMyJobs()
    }
  }

  const handleComplete = async (jobId: string) => {
    if (!completionFile) {
        toast.error('Please upload a picture of the finished part')
        return
    }

    const fileExt = completionFile.name.split('.').pop()
    const fileName = `completed/${jobId}-${Math.random()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
        .from('job-files')
        .upload(fileName, completionFile)

    if (uploadError) {
        toast.error('Error uploading image: ' + uploadError.message)
        return
    }

    const { data: { publicUrl } } = supabase.storage
        .from('job-files')
        .getPublicUrl(fileName)

    const { error } = await supabase
        .from('jobs')
        .update({ 
            status: 'Completed', 
            completion_image_url: publicUrl 
        })
        .eq('id', jobId)

    if (error) {
        toast.error('Failed to complete job')
    } else {
        toast.success('Job marked as completed!')
        setCompletingJobId(null)
        setCompletionFile(null)
        fetchMyJobs()
    }
  }

  if (loading) return <div className="p-8 text-center text-funky-text">Loading panel...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-funky-yellow">Machinist Panel</h1>
      
      {jobs.length === 0 ? (
        <div className="text-center py-12">
            <p className="text-funky-text-dim mb-4">You haven't claimed any jobs yet.</p>
            <Link href="/">
                <Button>Go to Queue</Button>
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {jobs.map((job) => (
                <Card key={job.id} className="flex flex-col justify-between h-full min-h-[300px] border-l-4 border-l-funky-yellow">
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-bold text-funky-yellow uppercase tracking-wider">{job.type}</span>
                                <h3 className="text-xl font-bold text-white mt-1">{job.part_name}</h3>
                            </div>
                            <span className="text-xs text-funky-text-dim bg-funky-dark px-2 py-1 rounded">
                                {new Date(job.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-funky-text-dim">
                            <p><span className="text-white font-medium">Requester:</span> {job.requester}</p>
                            <p><span className="text-white font-medium">Est. Time:</span> {job.est_time}</p>
                            <div className="bg-funky-dark/50 p-3 rounded-lg mt-2">
                                <p className="italic">"{job.description}"</p>
                            </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {job.g_code_url && (
                                <a href={job.g_code_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded hover:bg-blue-900/50">
                                    <FileText size={12} /> G-Code
                                </a>
                            )}
                            {job.drawing_url && (
                                <a href={job.drawing_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded hover:bg-purple-900/50">
                                    <FileText size={12} /> Drawing
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-funky-dark space-y-3">
                        {completingJobId === job.id ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                <p className="text-sm font-medium text-white">Upload Finished Part Photo:</p>
                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setCompletionFile(e.target.files?.[0] || null)}
                                    className="text-xs"
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" className="w-full" onClick={() => handleComplete(job.id)}>
                                        Confirm
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setCompletingJobId(null)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Button 
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => setCompletingJobId(job.id)}
                                >
                                    <CheckCircle size={16} className="mr-2" /> Complete
                                </Button>
                                <Button 
                                    variant="secondary"
                                    onClick={() => handleUnclaim(job.id)}
                                >
                                    <XCircle size={16} />
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
      )}
    </div>
  )
}
