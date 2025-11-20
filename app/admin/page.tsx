'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

type Profile = {
  id: string
  full_name: string
  role: string
  is_approved: boolean
  email?: string // We might need to join with auth.users or store email in profiles if needed, but let's stick to what we have. 
                 // Actually, for admin view, seeing email is helpful. 
                 // Since we can't easily join auth.users from client, we'll rely on full_name or add email to profiles trigger if we want.
                 // For now, let's just show full_name.
}

export default function AdminPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/') // Redirect non-admins
        return
      }

      fetchUsers()
    }

    checkAdmin()
  }, [router, supabase])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false } as any) // created_at might not be in types yet if we didn't add it to TS types, but it's in DB
    
    if (data) {
        setUsers(data)
    }
    setLoading(false)
  }

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: !currentStatus })
      .eq('id', userId)

    if (error) {
      alert('Error updating user: ' + error.message)
    } else {
      // Optimistic update
      setUsers(users.map(u => u.id === userId ? { ...u, is_approved: !currentStatus } : u))
    }
  }

  if (loading) return <div className="p-8 text-center text-funky-text">Loading admin panel...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-funky-yellow">Admin Panel</h1>
      
      <Card className="p-0 overflow-hidden bg-white text-black">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-lg">User Management</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{user.full_name || 'No Name'}</td>
                            <td className="px-4 py-3 uppercase text-xs font-bold text-gray-500">{user.role}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                    ${user.is_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.is_approved ? 'Approved' : 'Pending'}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                {user.role !== 'admin' && (
                                    <Button 
                                        size="sm" 
                                        variant={user.is_approved ? "secondary" : "primary"}
                                        onClick={() => toggleApproval(user.id, user.is_approved)}
                                    >
                                        {user.is_approved ? 'Revoke' : 'Approve'}
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  )
}
