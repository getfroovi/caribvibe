'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const identifier = formData.get('email') as string
  const password = formData.get('password') as string
  
  let loginEmail = identifier;

  // If the identifier doesn't have an @ symbol, assume it's a username
  if (!identifier.includes('@')) {
    const { data: emailData, error: rpcError } = await supabase
      .rpc('get_email_by_username', { p_username: identifier });
      
    if (rpcError || !emailData) {
      redirect(`/login?error=${encodeURIComponent('Invalid username or password')}`)
    }
    loginEmail = emailData;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        username: formData.get('username') as string,
        full_name: formData.get('full_name') as string,
      }
    }
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (!authData.session) {
    redirect('/login?message=Check your email to confirm your account')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  // The redirectTo URL must be registered in Supabase Dashboard (Authentication -> URL Configuration)
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?message=Password reset link sent to your email')
}
