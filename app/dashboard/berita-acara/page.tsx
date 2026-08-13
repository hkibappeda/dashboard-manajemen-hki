import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function BeritaAcaraPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard') // Only admins can see audit logs
  }

  // Get audit logs
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('id, created_at, action, report_code, user_snapshot, metadata')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Riwayat Aktivitas Laporan</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Berita Acara</CardTitle>
          <CardDescription>
            Rekam jejak persetujuan kerahasiaan dan pembuatan laporan HKI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Aktivitas</TableHead>
                  <TableHead>Report Code</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!logs || logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      Belum ada riwayat aktivitas.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const snapshot = log.user_snapshot as { name?: string; role?: string } | null
                    const metadata = log.metadata as { year?: number; statusName?: string } | null
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {log.created_at ? format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: id }) : '-'}
                        </TableCell>
                        <TableCell>
                          {snapshot?.name || 'Unknown'}
                          <div className="text-xs text-muted-foreground">{snapshot?.role || ''}</div>
                        </TableCell>
                        <TableCell>
                          {log.action === 'ACCEPT_CONFIDENTIALITY' ? (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                              Menyetujui Kerahasiaan
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                              Generate Laporan
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.report_code || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {metadata ? (
                            <span>
                              Tahun: {metadata.year || 'Semua'}, Status: {metadata.statusName || 'Semua'}
                            </span>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
