'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { HKIHistory } from '@/lib/types'
import { Loader2, Clock, Plus, Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface HKIHistoryTabProps {
  hkiId: number
}

async function fetchHistory(hkiId: number): Promise<HKIHistory[]> {
  const res = await fetch(`/api/hki/${hkiId}/history`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Gagal memuat riwayat')
  return json.data
}

export function HKIHistoryTab({ hkiId }: HKIHistoryTabProps) {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['hki-history', hkiId],
    queryFn: () => fetchHistory(hkiId),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Memuat riwayat perubahan...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Terjadi kesalahan saat memuat riwayat.</p>
        <p className="text-sm opacity-80">{(error as Error).message}</p>
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p>Belum ada riwayat perubahan tercatat.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="relative border-l border-muted-foreground/20 ml-3 md:ml-4 space-y-8 pb-4">
        {history.map((item, index) => {
          const isInsert = item.action === 'INSERT'
          const isUpdate = item.action === 'UPDATE'
          const isDelete = item.action === 'DELETE'
          
          let Icon = Edit2
          let iconColor = 'text-blue-500 border-blue-200 bg-blue-100 dark:bg-blue-900/50 dark:border-blue-800'
          if (isInsert) {
            Icon = Plus
            iconColor = 'text-green-500 border-green-200 bg-green-100 dark:bg-green-900/50 dark:border-green-800'
          } else if (isDelete) {
            Icon = Trash2
            iconColor = 'text-destructive border-red-200 bg-destructive/10 dark:border-red-900/50'
          }

          const userName = item.profile?.full_name || item.profile?.email || 'Sistem / Tidak diketahui'

          // Get changed fields for updates
          let changedFields: string[] = []
          if (isUpdate && item.old_data && item.new_data) {
            const oldData = item.old_data as Record<string, any>
            const newData = item.new_data as Record<string, any>
            const excludedKeys = ['updated_at', 'updated_by', 'created_at'] // fields to ignore
            
            Object.keys(newData).forEach(key => {
              if (!excludedKeys.includes(key) && oldData[key] !== newData[key]) {
                changedFields.push(key)
              }
            })
          }

          return (
            <div key={item.id} className="relative pl-6 md:pl-8">
              <div
                className={cn(
                  'absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full border',
                  iconColor
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center flex-wrap gap-2 text-sm">
                  <span className="font-semibold text-foreground">{userName}</span>
                  <span className="text-muted-foreground">
                    {isInsert ? 'membuat data ini' : isUpdate ? 'memperbarui data ini' : 'menghapus data ini'}
                  </span>
                </div>
                {changedFields.length > 0 && (
                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md my-1 border w-fit">
                    Mengubah: <span className="font-medium text-foreground">{changedFields.join(', ')}</span>
                  </div>
                )}
                <time className="text-xs text-muted-foreground font-medium">
                  {format(new Date(item.changed_at), 'd MMMM yyyy, HH:mm', { locale: id })}
                </time>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
