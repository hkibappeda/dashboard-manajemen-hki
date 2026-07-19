import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { Database } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const idSchema = z.coerce.number().int().positive('ID tidak valid.')

function apiError(message: string, status: number, errors?: object) {
  return NextResponse.json({ message, errors }, { status })
}

class AuthError extends Error {
  constructor(message = 'Akses ditolak.') {
    super(message)
    this.name = 'AuthError'
  }
}

async function authorizeAdmin(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new AuthError('Anda tidak terautentikasi.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new AuthError('Hanya admin yang dapat melakukan aksi ini.')
  }
  return user
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params
  const supabase = await createClient()

  try {
    const hkiId = idSchema.parse(rawId)
    await authorizeAdmin(supabase)

    const { data, error } = await supabase
      .from('hki_history')
      .select(`
        id, hki_id, action, old_data, new_data, changed_by, changed_at,
        profile:profiles(id, full_name, email, role)
      `)
      .eq('hki_id', hkiId)
      .order('changed_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    if (err instanceof z.ZodError)
      return apiError('Input tidak valid.', 400, err.flatten().fieldErrors)
    if (err instanceof AuthError) return apiError(err.message, 403)

    console.error('[API GET HKI History Error]:', err)
    return apiError(`Terjadi kesalahan pada server: ${err.message}`, 500)
  }
}
