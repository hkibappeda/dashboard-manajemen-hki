//app/actions/auth.ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
export async function signOutAction() {
  const supabase = await createClient()

  let hasError = false

  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[signOutAction] Supabase signOut error:', error.message)
      hasError = true
    }
  } catch (err) {
    console.error('[signOutAction] Unexpected error during signOut:', err)
    hasError = true
  }
  if (hasError) {
    redirect('/login?logout=error')
  }

  redirect('/login?logout=success')
}
