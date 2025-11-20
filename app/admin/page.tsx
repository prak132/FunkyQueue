'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Profile = {
  id: string
  full_name: string
  role: string
  is_approved: boolean
  email?: string
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/')
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
      .order('full_name', { ascending: true })
    
    if (data) {
        setUsers(data)
    }
    setLoading(false)
  }

  const changeUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      toast.error('Error updating user role: ' + error.message)
    } else {
      toast.success('User role updated successfully')
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    }
  }

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: !currentStatus })
      .eq('id', userId)

    if (error) {
      toast.error('Error updating user: ' + error.message)
    } else {
      toast.success('User approval status updated')
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
                            <td className="px-4 py-3">
                                <select
                                    className="px-3 py-2 rounded-lg border border-funky-dark bg-funky-black text-xs font-semibold uppercase text-funky-text hover:bg-funky-dark focus:outline-none focus:ring-2 focus:ring-funky-yellow transition-colors cursor-pointer"
                                    value={user.role}
                                    onChange={(e) => changeUserRole(user.id, e.target.value)}
                                >
                                    <option value="user" className="bg-funky-black text-funky-text">User</option>
                                    <option value="machinist" className="bg-funky-black text-funky-text">Machinist</option>
                                    <option value="designer" className="bg-funky-black text-funky-text">Designer</option>
                                    <option value="admin" className="bg-funky-black text-funky-text">Admin</option>
                                </select>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                    ${user.is_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.is_approved ? 'Approved' : 'Pending'}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <Button 
                                    size="sm" 
                                    variant={user.is_approved ? "secondary" : "primary"}
                                    onClick={() => toggleApproval(user.id, user.is_approved)}
                                >
                                    {user.is_approved ? 'Revoke' : 'Approve'}
                                </Button>
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
