import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock } from 'lucide-react'

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const resolvedParams = await searchParams

  if (!user) {
    redirect('/login')
  }

  async function updatePassword(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      redirect(`/update-password?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/login?message=Password updated successfully! Please log in with your new password.')
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black px-4">
      <div className="w-full max-w-[420px] bg-zinc-950 p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Update Password</h2>
          <p className="text-zinc-400 text-sm">Enter your new password below.</p>
        </div>

        <form className="space-y-5" action={updatePassword}>
          {resolvedParams.error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-sm border border-red-500/20 font-medium">
              {resolvedParams.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300 font-medium">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••"
                required 
                className="bg-black/50 border-white/10 focus:border-pink-500/50 focus:ring-pink-500/20 text-white pl-10 h-12 rounded-xl transition-all" 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white rounded-xl font-bold text-base transition-all shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:shadow-[0_0_30px_rgba(219,39,119,0.5)]"
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  )
}
