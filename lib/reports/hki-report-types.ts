// lib/reports/hki-report-types.ts

export interface AggregateItem {
  total: number
}

export interface ByYearItem extends AggregateItem {
  tahun: number
}

export interface ByStatusItem extends AggregateItem {
  id_status: number
  nama_status: string
}

export interface ByJenisItem extends AggregateItem {
  id_jenis_hki: number
  nama_jenis_hki: string
}

export interface ByPengusulItem extends AggregateItem {
  id_pengusul: number
  nama_opd: string
}

export interface HKIReportSummary {
  total_pengajuan: number
  by_year: ByYearItem[]
  by_status: ByStatusItem[]
  by_jenis_hki: ByJenisItem[]
  by_pengusul: ByPengusulItem[]
}

export interface ReportFilters {
  year: number | null
  statusId: number | null
  statusName: string | null
}

export interface ReportInsights {
  trendInsight: string
  statusInsight: string
  jenisInsight: string
  pengusulInsight: string
  conclusion: string
  recommendations: string[]
}

export interface ReportFilterOptions {
  tahunOptions: number[]
  statusOptions: { id_status: number; nama_status: string }[]
}
