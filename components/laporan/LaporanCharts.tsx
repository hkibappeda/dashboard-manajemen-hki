// components/laporan/LaporanCharts.tsx
'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
  Cell,
  Pie,
  PieChart,
  Tooltip,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { TrendingUp, BookCheck, Copyright, FileSearch, Filter } from 'lucide-react'
import type { HKIReportSummary } from '@/lib/reports/hki-report-types'

const STATUS_PALETTE = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

const BAR_PALETTE = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

const BAR_MUTED = 'hsl(var(--muted-foreground) / 0.18)'

interface LaporanChartsProps {
  summary: HKIReportSummary
  activeYear: number | null
  activeStatusId: number | null
  activeStatusName: string | null
}

const EmptyChartState = ({ message = "Belum Ada Data" }: { message?: string }) => (
  <div className="flex flex-col h-[200px] items-center justify-center text-muted-foreground bg-slate-50/50 dark:bg-slate-900/20 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 m-4">
    <FileSearch className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{message}</p>
  </div>
)

function FilterBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5">
      <Filter className="h-3 w-3" />
      {label}
    </span>
  )
}

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  total,
}: {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  total: number
  [key: string]: unknown
}) => {
  if (total === 0) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight="bold"
    >
      {total.toLocaleString('id-ID')}
    </text>
  )
}

export function LaporanCharts({
  summary,
  activeYear,
  activeStatusId,
  activeStatusName,
}: LaporanChartsProps) {
  const yearChartConfig: ChartConfig = {
    total: { label: 'Jumlah Pengajuan', color: 'hsl(var(--chart-1))' },
  }

  const sortedYearData = [...summary.by_year].sort((a, b) => a.tahun - b.tahun)

  const statusData = summary.by_status
    .filter((s) => s.total > 0)
    .map((s, i) => ({
      ...s,
      fill: STATUS_PALETTE[i % STATUS_PALETTE.length],
    }))

  const jenisData = summary.by_jenis_hki
    .filter((j) => j.total > 0)
    .slice(0, 8)

  // ── Dynamic descriptions based on active filters ──
  const yearChartDesc = activeStatusName
    ? `Tren pengajuan berstatus "${activeStatusName}" per tahun.`
    : 'Jumlah total pengajuan HKI yang difasilitasi setiap tahunnya.'

  const statusChartDesc = activeYear
    ? `Proporsi pengajuan pada tahun ${activeYear} berdasarkan status.`
    : 'Proporsi pengajuan berdasarkan status saat ini.'

  const jenisChartDesc =
    activeYear && activeStatusName
      ? `Jenis HKI untuk tahun ${activeYear}, status "${activeStatusName}".`
      : activeYear
        ? `Jenis HKI untuk tahun ${activeYear}.`
        : activeStatusName
          ? `Jenis HKI berstatus "${activeStatusName}".`
          : 'Jumlah pengajuan berdasarkan jenis Hak Kekayaan Intelektual.'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Bar Chart: Pengajuan per Tahun ── */}
      <Card className="lg:col-span-3 shadow-sm dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Pengajuan per Tahun
            {activeStatusName && <FilterBadge label={activeStatusName} />}
          </CardTitle>
          <CardDescription>{yearChartDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedYearData.length === 0 ? (
            <EmptyChartState message="Belum ada data pengajuan per tahun." />
          ) : (
            <ChartContainer config={yearChartConfig} className="h-[250px] w-full">
                <BarChart
                  data={sortedYearData}
                  margin={{ top: 30, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="tahun" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} width={30} allowDecimals={false} className="text-xs" />
                  <ChartTooltip
                    cursor={{ fill: 'hsl(var(--accent))', radius: 4 }}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(label) => `Tahun ${label}`}
                        indicator="dot"
                      />
                    }
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    <LabelList position="top" offset={8} className="fill-foreground text-xs font-semibold" formatter={(v: number) => (v > 0 ? v : '')} />
                    {sortedYearData.map((entry, i) => {
                      // When year filter is active, highlight that year's bar
                      // and mute the others so the active year stands out
                      const isActive = activeYear === null || entry.tahun === activeYear
                      return (
                        <Cell
                          key={i}
                          fill={isActive ? BAR_PALETTE[i % BAR_PALETTE.length] : BAR_MUTED}
                          opacity={isActive ? 1 : 0.6}
                        />
                      )
                    })}
                  </Bar>
                </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Pie Chart: Distribusi Status ── */}
      <Card className="lg:col-span-2 shadow-sm dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookCheck className="h-5 w-5 text-emerald-600" />
            Distribusi Status
            {activeYear && <FilterBadge label={`${activeYear}`} />}
          </CardTitle>
          <CardDescription>{statusChartDesc}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {statusData.length === 0 ? (
            <EmptyChartState message="Belum ada data distribusi status." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      value.toLocaleString('id-ID'),
                      name,
                    ]}
                  />
                  <Pie
                    data={statusData}
                    dataKey="total"
                    nameKey="nama_status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    label={renderCustomLabel}
                    labelLine={false}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 px-1">
                {statusData.map((s, i) => (
                  <div key={s.id_status} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: STATUS_PALETTE[i % STATUS_PALETTE.length] }}
                      />
                      <span className="truncate text-foreground">{s.nama_status}</span>
                    </div>
                    <span className="font-semibold tabular-nums text-foreground shrink-0">
                      {s.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Horizontal Bar Chart: Distribusi Jenis HKI ── */}
      <Card className="lg:col-span-5 shadow-sm dark:border-gray-800">
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Copyright className="h-5 w-5 text-violet-600" />
              Distribusi Jenis HKI
            </CardTitle>
            {activeYear && <FilterBadge label={`${activeYear}`} />}
            {activeStatusName && <FilterBadge label={activeStatusName} />}
          </div>
          <CardDescription>{jenisChartDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {jenisData.length === 0 ? (
            <EmptyChartState message="Belum ada data jenis HKI." />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(160, jenisData.length * 40)}>
              <BarChart data={jenisData} layout="vertical" margin={{ top: 0, right: 50, left: 10, bottom: 0 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" allowDecimals={false} />
                <YAxis
                  dataKey="nama_jenis_hki"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }} formatter={(v: number) => [v.toLocaleString('id-ID'), 'Jumlah']} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  <LabelList position="right" className="fill-foreground text-xs font-semibold" formatter={(v: number) => (v > 0 ? v.toLocaleString('id-ID') : '')} />
                  {jenisData.map((_, i) => (
                    <Cell key={i} fill={STATUS_PALETTE[i % STATUS_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
