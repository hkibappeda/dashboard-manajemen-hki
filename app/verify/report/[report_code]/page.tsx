import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'
import { AlertTriangle, CheckCircle2, FileText, Search, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { VerifyFileUploader } from '@/components/laporan/VerifyFileUploader'

export const dynamic = 'force-dynamic'

async function getReportVerification(reportCode: string) {
  // Use Service Role to bypass RLS and query audit_logs securely from server
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  const { data, error } = await supabase
    .from('audit_logs')
    .select('created_at, action, user_snapshot, metadata')
    .eq('report_code', reportCode)
    .eq('action', 'GENERATE_REPORT')
    .single()

  if (error || !data) return null
  return data
}

export default async function VerifyReportPage(
  props: { params: Promise<{ report_code: string }> }
) {
  const params = await props.params;
  const reportCode = params.report_code

  if (!reportCode || !reportCode.startsWith('HKI-RPT-')) {
    notFound()
  }

  const reportData = await getReportVerification(reportCode)

  if (!reportData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-destructive/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive">Laporan Tidak Ditemukan</CardTitle>
            <CardDescription>
              Sistem tidak dapat memvalidasi dokumen dengan kode tersebut.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Alert variant="destructive">
              <AlertTitle>Verifikasi Gagal</AlertTitle>
              <AlertDescription>
                Kode laporan <strong>{reportCode}</strong> tidak terdaftar atau merupakan dokumen palsu.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  const generatedAt = new Date(reportData.created_at!)
  const snapshot = reportData.user_snapshot as { name?: string; role?: string } | null
  // Sensor nama untuk keamanan publik, tampilkan inisial/depan saja
  const nameParts = (snapshot?.name || 'Administrator').split(' ')
  const maskedName = nameParts.length > 1 
    ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}***` 
    : `${nameParts[0].charAt(0)}***`

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-emerald-500/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl text-emerald-700">Laporan Valid</CardTitle>
          <CardDescription>
            Dokumen ini merupakan laporan resmi yang tercatat pada sistem.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-slate-100 p-2 rounded-md text-slate-500">
                <Search className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Report Code</p>
                <p className="font-mono text-slate-900 font-semibold">{reportCode}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-slate-100 p-2 rounded-md text-slate-500">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Jenis Dokumen</p>
                <p className="text-slate-900 font-medium">Laporan Rekapitulasi Data HKI</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-emerald-50 p-2 rounded-md text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Dibuat Pada</p>
                <p className="text-slate-900 font-medium">
                  {generatedAt.toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })} WIB
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Oleh: Admin ({maskedName})</p>
              </div>
            </div>

            {reportData.metadata && (reportData.metadata as any).summary_snapshot && (
              <div className="flex items-start gap-3 mt-4 pt-4 border-t border-slate-100">
                <div className="mt-0.5 bg-blue-50 p-2 rounded-md text-blue-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Ringkasan Data Asli</p>
                  <p className="text-slate-900 font-medium">
                    Total Pengajuan: {(reportData.metadata as any).summary_snapshot.total_pengajuan || 0} entri
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Angka pada fisik dokumen harus sama persis dengan angka ini.</p>
                </div>
              </div>
            )}
          </div>

          <Alert className="bg-slate-50 border-slate-200">
            <AlertDescription className="text-xs text-slate-500 leading-relaxed text-center">
              Halaman ini memvalidasi keaslian metadata pembuatan laporan. Pastikan Ringkasan Data Asli di atas sesuai dengan isi fisik dokumen untuk mencegah manipulasi.
            </AlertDescription>
          </Alert>

          {reportData.metadata && (reportData.metadata as any).file_hash && (
            <VerifyFileUploader originalHash={(reportData.metadata as any).file_hash} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
