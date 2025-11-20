'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) setEmail(user.email)
    }
    getUser()
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }
    
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    
    if (error) {
      toast.error('Error updating password: ' + error.message)
    } else {
      toast.success('Password updated successfully')
      setPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-funky-yellow">Account Settings</h1>
      
      <Card className="p-8 space-y-6">
        <div>
            <h2 className="text-xl font-bold text-white mb-4">Profile Info</h2>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-funky-text-dim">Email</label>
                <Input disabled value={email} className="opacity-50 cursor-not-allowed" />
                <p className="text-xs text-funky-text-dim">Email cannot be changed currently.</p>
            </div>
        </div>

        <div className="border-t border-funky-dark pt-6">
            <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-funky-text-dim mb-1">New Password</label>
                    <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New password"
                        required
                        minLength={6}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-funky-text-dim mb-1">Confirm Password</label>
                    <Input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                </Button>
            </form>
        </div>

        <div className="border-t border-funky-dark pt-6">
            <h2 className="text-xl font-bold text-red-500 mb-4">Danger Zone</h2>
            <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" onClick={handleSignOut}>
                Sign Out
            </Button>
        </div>
      </Card>
    </div>
  )
}
