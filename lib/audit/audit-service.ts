import { createClient } from '@supabase/supabase-js'
import { Database } from '../database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey)

type UserSnapshot = {
  name: string
  role: string
}

export async function logAcceptConfidentiality(userId: string, snapshot: UserSnapshot) {
  const { error } = await supabaseAdmin.from('audit_logs').insert({
    user_id: userId,
    user_snapshot: snapshot,
    action: 'ACCEPT_CONFIDENTIALITY',
    resource_type: 'LAPORAN_HKI',
    report_code: null,
  })

  if (error) {
    console.error('Failed to log ACCEPT_CONFIDENTIALITY', error)
    // We might not throw here to avoid failing the report generation completely 
    // just because logging failed, but for strict audit compliance, we probably should.
    throw new Error('Gagal mencatat persetujuan kerahasiaan: ' + error.message)
  }
}

export async function logGenerateReport(
  userId: string,
  snapshot: UserSnapshot,
  reportCode: string,
  metadata: any = null
) {
  const { error } = await supabaseAdmin.from('audit_logs').insert({
    user_id: userId,
    user_snapshot: snapshot,
    action: 'GENERATE_REPORT',
    resource_type: 'LAPORAN_HKI',
    report_code: reportCode,
    metadata,
  })

  if (error) {
    console.error('Failed to log GENERATE_REPORT', error)
    throw new Error('Gagal mencatat histori pembuatan laporan: ' + error.message)
  }
}
