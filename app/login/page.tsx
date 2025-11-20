'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-funky-black">
      <Card className="w-full max-w-md space-y-8 border-funky-dark bg-funky-black/50 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-funky-yellow">
            FunkyQueue
          </h2>
          <p className="mt-2 text-sm text-funky-text-dim">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
            <label className="block text-sm font-medium text-funky-text-dim mb-1">Password</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <div className="flex justify-end mt-1">
                <Link href="/forgot-password" className="text-xs text-funky-yellow hover:underline">
                    Forgot Password?
                </Link>
            </div>
          </div>
        </div>

          {error && (
            <div className="text-sm text-red-500 text-center">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-funky-text-dim">Don't have an account? </span>
            <Link href="/signup" className="text-funky-yellow hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
