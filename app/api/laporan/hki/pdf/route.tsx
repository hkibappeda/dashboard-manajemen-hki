// app/api/laporan/hki/pdf/route.tsx
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { renderToStream } from '@react-pdf/renderer'
import { HKIReportPDF } from '@/lib/reports/hki-report-pdf'
import { getHKIReportSummary } from '@/lib/reports/hki-report-service'
import { generateAllInsights } from '@/lib/reports/hki-report-insights'
import type { ReportFilters } from '@/lib/reports/hki-report-types'
import { logAcceptConfidentiality, logGenerateReport } from '@/lib/audit/audit-service'
import QRCode from 'qrcode'
import React from 'react'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengunduh laporan.' },
        { status: 403 }
      )
    }

    const body = await req.json().catch(() => null)
    if (!body?.consent) {
      return NextResponse.json(
        { error: 'Persetujuan kerahasiaan diperlukan.' },
        { status: 400 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const yearParam = searchParams.get('year')
    const statusParam = searchParams.get('status')

    const year = yearParam ? parseInt(yearParam, 10) : null
    const statusId = statusParam ? parseInt(statusParam, 10) : null

    let statusName: string | null = null
    if (statusId) {
      const { data: statusData } = await supabase
        .from('status_hki')
        .select('nama_status')
        .eq('id_status', statusId)
        .single()
      statusName = statusData?.nama_status ?? null
    }

    const filters: ReportFilters = { year, statusId, statusName }

    // Log ACCEPT_CONFIDENTIALITY (report_code is null)
    const userSnapshot = { name: profile.full_name || 'Administrator', role: profile.role }
    await logAcceptConfidentiality(user.id, userSnapshot)

    // Generate Report Code (server-side, crypto-safe)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomPart = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()
    const reportCode = `HKI-RPT-${dateStr}-${randomPart}`

    const summary = await getHKIReportSummary(year, statusId)
    const insights = generateAllInsights(summary, filters)

    const generatedAt = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // QR Code wajib mengarah ke URL Verifikasi untuk memastikan sistem traceability bekerja
    // Jika hanya teks statis, siapa saja dapat memalsukannya menggunakan generator pihak ketiga.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
    if (!appUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL belum dikonfigurasi. QR Code tidak dapat dibuat tanpa domain yang valid.')
    }
    const verificationUrl = `${appUrl}/verify/report/${reportCode}`

    const qrDataUri = await QRCode.toDataURL(verificationUrl, {
      width: 120,
      margin: 2,
      errorCorrectionLevel: 'H'
    })

    // Read logo as base64 to ensure it renders reliably in the PDF regardless of path issues
    const logoPath = path.join(process.cwd(), 'public', 'logo_sleman.png')
    const logoBase64 = fs.readFileSync(logoPath, 'base64')
    const logoDataUri = `data:image/png;base64,${logoBase64}`

    const stream = await renderToStream(
      <HKIReportPDF
        summary={summary}
        insights={insights}
        filters={filters}
        generatedAt={generatedAt}
        generatorName={profile.full_name || 'Administrator'}
        reportCode={reportCode}
        qrDataUri={qrDataUri}
        logoDataUri={logoDataUri}
      />
    )

    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)

    // Create SHA-256 hash of the generated PDF for authenticity verification
    const fileHash = crypto.createHash('sha256').update(pdfBuffer).digest('hex')

    // After success, log GENERATE_REPORT with data snapshot for anti-tamper verification
    const auditMetadata = {
      filters,
      file_hash: fileHash,
      summary_snapshot: {
        total_pengajuan: summary.total_pengajuan
      }
    }
    await logGenerateReport(user.id, userSnapshot, reportCode, auditMetadata)

    const yearLabel = year ? `-${year}` : '-semua-tahun'
    const statusLabel = statusName
      ? `-status-${statusName.toLowerCase().replace(/\s+/g, '-')}`
      : ''
    const fileName = `laporan-hki${yearLabel}${statusLabel}.pdf`

    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    ) as ArrayBuffer

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: unknown) {
    console.error('[PDF API Error]:', error)
    const message = error instanceof Error ? error.message : 'Gagal membuat laporan PDF.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
