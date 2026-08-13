// lib/reports/hki-report-pdf.tsx
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import type { HKIReportSummary, ReportFilters, ReportInsights } from './hki-report-types'
import { getTopItem } from './hki-report-insights'
import path from 'path'

const BLUE_PRIMARY = '#1e3a8a'
const BLUE_ACCENT = '#2563eb'
const BLUE_LIGHT = '#eff6ff'
const BLUE_BORDER = '#bfdbfe'
const GRAY_TEXT = '#374151'
const GRAY_LIGHT = '#6b7280'
const DARK = '#1a1a1a'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 80,
    paddingHorizontal: 50,
    color: DARK,
    backgroundColor: '#ffffff',
  },
  // --- Kop Instansi ---
  kopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    gap: 14,
  },
  kopLogo: {
    width: 56,
    height: 56,
  },
  kopTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  kopLine1: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    color: DARK,
  },
  kopLine2: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginTop: 2,
    color: DARK,
  },
  kopSeparator: {
    borderBottomWidth: 3,
    borderBottomColor: BLUE_PRIMARY,
    borderBottomStyle: 'solid',
    marginBottom: 2,
  },
  kopSeparatorThin: {
    borderBottomWidth: 1,
    borderBottomColor: BLUE_ACCENT,
    borderBottomStyle: 'solid',
    marginBottom: 18,
  },
  // --- Judul Dokumen ---
  titleContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  titleMain: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    color: BLUE_PRIMARY,
  },
  titleSub: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginTop: 2,
    color: BLUE_PRIMARY,
  },
  titleUnderline: {
    width: 120,
    borderBottomWidth: 2,
    borderBottomColor: BLUE_ACCENT,
    borderBottomStyle: 'solid',
    marginTop: 6,
  },
  // --- Identitas Laporan ---
  metaContainer: {
    marginBottom: 18,
    backgroundColor: BLUE_LIGHT,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: BLUE_ACCENT,
    borderLeftStyle: 'solid',
    borderRadius: 2,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  metaLabel: {
    width: 140,
    fontSize: 10,
    color: GRAY_TEXT,
  },
  metaSeparator: {
    width: 12,
    fontSize: 10,
    color: GRAY_TEXT,
  },
  metaValue: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  // --- Section ---
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLUE_PRIMARY,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: BLUE_BORDER,
    borderBottomStyle: 'solid',
  },
  // --- Stats ---
  statsContainer: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingVertical: 2,
  },
  statsLabel: {
    width: 200,
    fontSize: 10,
    color: GRAY_TEXT,
  },
  statsValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  // --- Table ---
  table: {
    width: '100%',
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BLUE_PRIMARY,
    padding: '6 10',
    alignItems: 'center',
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    paddingRight: 4,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '6 10',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    alignItems: 'flex-start',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 9,
    color: GRAY_TEXT,
    paddingRight: 4,
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  tableFooter: {
    borderTopWidth: 1,
    borderTopColor: BLUE_PRIMARY,
    borderTopStyle: 'solid',
  },
  // --- Text ---
  bodyText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: GRAY_TEXT,
    textAlign: 'justify',
  },
  insightItem: {
    marginBottom: 6,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: BLUE_ACCENT,
    borderLeftStyle: 'solid',
  },
  // --- Catatan Kerahasiaan ---
  confidentialityBox: {
    marginTop: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: BLUE_BORDER,
    borderStyle: 'solid',
    backgroundColor: BLUE_LIGHT,
    borderRadius: 2,
  },
  confidentialityTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: BLUE_PRIMARY,
    textTransform: 'uppercase',
  },
  confidentialityText: {
    fontSize: 8,
    color: GRAY_TEXT,
    lineHeight: 1.5,
  },
  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: BLUE_BORDER,
    borderTopStyle: 'solid',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerCol: {
    flexDirection: 'column',
    gap: 2,
  },
  footerText: {
    fontSize: 7,
    color: GRAY_LIGHT,
  },
  footerTextBold: {
    fontSize: 7,
    color: BLUE_PRIMARY,
    fontFamily: 'Helvetica-Bold',
  },
  qrContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  qrCode: {
    width: 54,
    height: 54,
  },
  qrCenterLogo: {
    position: 'absolute',
    width: 14,
    height: 14,
    top: 20, // (54 - 14) / 2
    left: 20, // (54 - 14) / 2
    backgroundColor: '#ffffff',
    padding: 1.5,
  },
  qrCaption: {
    fontSize: 6,
    color: GRAY_LIGHT,
    textAlign: 'center',
  },
  colNo: { width: '8%', paddingRight: 4 },
  colNama: { flex: 1, paddingRight: 10 },
  colTotal: { width: '22%', textAlign: 'right', paddingLeft: 4 },
})

interface HKIReportPDFProps {
  summary: HKIReportSummary
  insights: ReportInsights
  filters: ReportFilters
  generatedAt: string
  generatorName: string
  reportCode: string
  qrDataUri: string
  logoDataUri: string
}

function formatIDN(n: number): string {
  return n.toLocaleString('id-ID')
}

function KopInstansi({ logoDataUri }: { logoDataUri: string }) {
  return (
    <View>
      <View style={styles.kopContainer}>
        <Image style={styles.kopLogo} src={logoDataUri} />
        <View style={styles.kopTextContainer}>
          <Text style={styles.kopLine1}>Pemerintah Kabupaten Sleman</Text>
          <Text style={styles.kopLine2}>
            Badan Perencanaan Pembangunan Daerah
          </Text>
        </View>
        {/* Spacer to visually balance the logo on the left */}
        <View style={{ width: 56 }} />
      </View>
      <View style={styles.kopSeparator} />
      <View style={styles.kopSeparatorThin} />
    </View>
  )
}

function FooterDokumen({
  generatorName,
  generatedAt,
  reportCode,
  qrDataUri,
  logoDataUri,
}: {
  generatorName: string
  generatedAt: string
  reportCode: string
  qrDataUri: string
  logoDataUri?: string
}) {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerCol}>
        <Text style={styles.footerTextBold}>
          Dokumen Internal dan Terbatas
        </Text>
        <Text style={styles.footerText}>
          Kode Laporan: {reportCode}
        </Text>
        <Text style={styles.footerText}>
          Dihasilkan Oleh: {generatorName}
        </Text>
        <Text style={styles.footerText}>
          Tanggal: {generatedAt}
        </Text>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) =>
            `Halaman ${pageNumber} dari ${totalPages}`
          }
        />
      </View>
      {qrDataUri && (
        <View style={styles.qrContainer}>
          <Image style={styles.qrCode} src={qrDataUri} />
          {logoDataUri && <Image style={styles.qrCenterLogo} src={logoDataUri} />}
          <Text style={styles.qrCaption}>Verifikasi Keaslian{'\n'}Dokumen</Text>
        </View>
      )}
    </View>
  )
}

export function HKIReportPDF({
  summary,
  insights,
  filters,
  generatedAt,
  generatorName,
  reportCode,
  qrDataUri,
  logoDataUri,
}: HKIReportPDFProps) {
  const topStatus = getTopItem(summary.by_status)
  const topYear = getTopItem(summary.by_year)
  const topJenis = getTopItem(summary.by_jenis_hki)

  return (
    <Document
      title="Laporan Data Pengajuan HKI"
      author="Badan Perencanaan Pembangunan Daerah Kabupaten Sleman"
      creator="Sistem Manajemen HKI"
    >
      {/* ====== HALAMAN 1 ====== */}
      <Page size="A4" style={styles.page}>
        {/* Kop Instansi */}
        <KopInstansi logoDataUri={logoDataUri} />

        {/* Judul Dokumen */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleMain}>Laporan Data Pengajuan</Text>
          <Text style={styles.titleSub}>Hak Kekayaan Intelektual (HKI)</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* Identitas Laporan */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Kode Laporan</Text>
            <Text style={styles.metaSeparator}>:</Text>
            <Text style={styles.metaValue}>{reportCode}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Dihasilkan Oleh</Text>
            <Text style={styles.metaSeparator}>:</Text>
            <Text style={styles.metaValue}>{generatorName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Peran</Text>
            <Text style={styles.metaSeparator}>:</Text>
            <Text style={styles.metaValue}>Administrator</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Tanggal Pembuatan</Text>
            <Text style={styles.metaSeparator}>:</Text>
            <Text style={styles.metaValue}>{generatedAt}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Tahun Fasilitasi</Text>
            <Text style={styles.metaSeparator}>:</Text>
            <Text style={styles.metaValue}>
              {filters.year ? String(filters.year) : 'Semua Tahun'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Status HKI</Text>
            <Text style={styles.metaSeparator}>:</Text>
            <Text style={styles.metaValue}>
              {filters.statusName ?? 'Semua Status'}
            </Text>
          </View>
        </View>

        {/* Ringkasan Statistik */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I. Ringkasan Statistik</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Total Pengajuan</Text>
              <Text style={styles.statsValue}>
                : {formatIDN(summary.total_pengajuan)} entri
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Status Dominan</Text>
              <Text style={styles.statsValue}>
                : {topStatus?.nama_status ?? '-'}{topStatus ? ` (${formatIDN(topStatus.total)} pengajuan)` : ''}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Tahun Terbanyak</Text>
              <Text style={styles.statsValue}>
                : {topYear?.tahun ?? '-'}{topYear ? ` (${formatIDN(topYear.total)} pengajuan)` : ''}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Jenis Terbanyak</Text>
              <Text style={styles.statsValue}>
                : {topJenis?.nama_jenis_hki ?? '-'}{topJenis ? ` (${formatIDN(topJenis.total)} pengajuan)` : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabel Per Tahun */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>II. Distribusi Pengajuan per Tahun</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNo]}>No</Text>
              <Text style={[styles.tableHeaderCell, styles.colNama]}>Tahun Fasilitasi</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Jumlah</Text>
            </View>
            {summary.by_year.sort((a, b) => b.tahun - a.tahun).map((row, i) => (
              <View
                key={row.tahun}
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.tableCell, styles.colNo]}>{i + 1}</Text>
                <Text style={[styles.tableCell, styles.colNama]}>{row.tahun}</Text>
                <Text style={[styles.tableCellBold, styles.colTotal]}>{formatIDN(row.total)}</Text>
              </View>
            ))}
            <View style={styles.tableFooter} />
          </View>
        </View>

        {/* Tabel Per Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>III. Distribusi Pengajuan per Status</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNo]}>No</Text>
              <Text style={[styles.tableHeaderCell, styles.colNama]}>Status HKI</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Jumlah</Text>
            </View>
            {summary.by_status.map((row, i) => (
              <View
                key={row.id_status}
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.tableCell, styles.colNo]}>{i + 1}</Text>
                <Text style={[styles.tableCell, styles.colNama]}>{row.nama_status}</Text>
                <Text style={[styles.tableCellBold, styles.colTotal]}>{formatIDN(row.total)}</Text>
              </View>
            ))}
            <View style={styles.tableFooter} />
          </View>
        </View>

        {/* Tabel Per Jenis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IV. Distribusi Pengajuan per Jenis HKI</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNo]}>No</Text>
              <Text style={[styles.tableHeaderCell, styles.colNama]}>Jenis HKI</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Jumlah</Text>
            </View>
            {summary.by_jenis_hki.map((row, i) => (
              <View
                key={row.id_jenis_hki}
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.tableCell, styles.colNo]}>{i + 1}</Text>
                <Text style={[styles.tableCell, styles.colNama]}>{row.nama_jenis_hki}</Text>
                <Text style={[styles.tableCellBold, styles.colTotal]}>{formatIDN(row.total)}</Text>
              </View>
            ))}
            <View style={styles.tableFooter} />
          </View>
        </View>

        {/* Footer Halaman 1 */}
        <FooterDokumen
          generatorName={generatorName}
          generatedAt={generatedAt}
          reportCode={reportCode}
          qrDataUri={qrDataUri}
          logoDataUri={logoDataUri}
        />
      </Page>

      {/* ====== HALAMAN 2: Pengusul & Insight ====== */}
      <Page size="A4" style={styles.page}>
        {/* Tabel Per Pengusul */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>V. Distribusi Pengajuan per Pengusul (OPD)</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNo]}>No</Text>
              <Text style={[styles.tableHeaderCell, styles.colNama]}>Nama OPD / Pengusul</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Jumlah</Text>
            </View>
            {summary.by_pengusul.filter((p) => p.total > 0).map((row, i) => (
              <View
                key={row.id_pengusul}
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.tableCell, styles.colNo]}>{i + 1}</Text>
                <Text style={[styles.tableCell, styles.colNama]}>{row.nama_opd}</Text>
                <Text style={[styles.tableCellBold, styles.colTotal]}>{formatIDN(row.total)}</Text>
              </View>
            ))}
            <View style={styles.tableFooter} />
          </View>
        </View>

        {/* Insight Analitis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VI. Analisis Data</Text>
          <View style={[styles.insightItem, { marginBottom: 8 }]}>
            <Text style={styles.bodyText}>{insights.trendInsight}</Text>
          </View>
          <View style={[styles.insightItem, { marginBottom: 8 }]}>
            <Text style={styles.bodyText}>{insights.statusInsight}</Text>
          </View>
          <View style={[styles.insightItem, { marginBottom: 8 }]}>
            <Text style={styles.bodyText}>{insights.jenisInsight}</Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.bodyText}>{insights.pengusulInsight}</Text>
          </View>
        </View>

        {/* Kesimpulan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VII. Kesimpulan</Text>
          <Text style={styles.bodyText}>{insights.conclusion}</Text>
        </View>

        {/* Catatan Kerahasiaan */}
        <View style={styles.confidentialityBox}>
          <Text style={styles.confidentialityTitle}>Catatan Kerahasiaan</Text>
          <Text style={styles.confidentialityText}>
            Dokumen ini merupakan dokumen internal dan terbatas milik Badan Perencanaan
            Pembangunan Daerah Kabupaten Sleman. Dilarang menyebarluaskan, menggandakan,
            atau memberikan dokumen ini kepada pihak yang tidak berkepentingan tanpa
            izin tertulis dari pejabat berwenang.
          </Text>
        </View>

        {/* Footer Halaman 2 */}
        <FooterDokumen
          generatorName={generatorName}
          generatedAt={generatedAt}
          reportCode={reportCode}
          qrDataUri={qrDataUri}
          logoDataUri={logoDataUri}
        />
      </Page>
    </Document>
  )
}
