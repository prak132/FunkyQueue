'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { toast } from 'sonner'

export default function AddCamJobPage() {
  const [partName, setPartName] = useState('')
  const [requesterName, setRequesterName] = useState('')
  const [description, setDescription] = useState('')
  const [estHours, setEstHours] = useState(0)
  const [estMinutes, setEstMinutes] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        
        if (profile?.full_name) {
          setRequesterName(profile.full_name)
        }
      }
    }
    fetchUserProfile()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        toast.error('You must be logged in')
        setLoading(false)
        return
    }

    let gCodeUrl = null
    if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `cam-jobs/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('job-files')
            .upload(filePath, file)

        if (uploadError) {
            toast.error('Error uploading file: ' + uploadError.message)
            setLoading(false)
            return
        }
        
        const { data: { publicUrl } } = supabase.storage
            .from('job-files')
            .getPublicUrl(filePath)
            
        gCodeUrl = publicUrl
    }

    const { error } = await supabase.from('jobs').insert({
      type: 'CAM',
      part_name: partName,
      requester: requesterName,
      description: description,
      est_hours: estHours,
      est_minutes: estMinutes,
      est_time: `${estHours}h ${estMinutes}m`,
      g_code_url: gCodeUrl,
      user_id: user.id,
      status: 'Pending'
    })

    if (error) {
      toast.error('Error adding job: ' + error.message)
      setLoading(false)
    } else {
      toast.success('CAM Job added successfully!')
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-funky-yellow mb-8">Add CAM Job</h1>
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-funky-text-dim mb-1">Part Name</label>
            <Input
              required
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="e.g. Intake Plate v2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-funky-text-dim mb-1">Description / Notes</label>
            <textarea
              className="flex w-full rounded-lg border border-funky-dark bg-funky-black px-3 py-2 text-sm text-funky-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-funky-yellow min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Material, special instructions, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-funky-text-dim mb-1">Est. Hours</label>
                <select 
                    className="flex w-full rounded-lg border border-funky-dark bg-funky-black px-3 py-2 text-sm text-funky-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-funky-yellow"
                    value={estHours}
                    onChange={(e) => setEstHours(Number(e.target.value))}
                >
                    {[...Array(11).keys()].map(i => (
                        <option key={i} value={i}>{i} hours</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-funky-text-dim mb-1">Est. Minutes</label>
                <select 
                    className="flex w-full rounded-lg border border-funky-dark bg-funky-black px-3 py-2 text-sm text-funky-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-funky-yellow"
                    value={estMinutes}
                    onChange={(e) => setEstMinutes(Number(e.target.value))}
                >
                    {[0, 15, 30, 45].map(i => (
                        <option key={i} value={i}>{i} mins</option>
                    ))}
                </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-funky-text-dim mb-1">Upload G-Code (Optional)</label>
            <Input
              type="file"
              accept=".nc,.gcode,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="file:text-funky-yellow file:mr-4 file:bg-transparent file:border-0 file:text-sm file:font-semibold hover:file:text-funky-yellow-hover cursor-pointer"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Job'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
