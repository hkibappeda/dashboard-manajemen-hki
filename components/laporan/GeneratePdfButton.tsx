//components/laporan/GeneratePdfButton.tsx
'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'

export function GeneratePdfButton() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const searchParams = useSearchParams()

  const handleGenerate = async () => {
    setIsGenerating(true)
    setShowConsent(false)
    const toastId = toast.loading('Membuat laporan PDF, harap tunggu...')

    try {
      const params = new URLSearchParams()
      const year = searchParams.get('year')
      const status = searchParams.get('status')

      if (year) params.set('year', year)
      if (status) params.set('status', status)

      const url = `/api/laporan/hki/pdf?${params.toString()}`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consent: true }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        throw new Error(errData?.error ?? 'Gagal membuat laporan PDF.')
      }

      const disposition = response.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="(.+?)"/)
      const fileName = match?.[1] ?? 'laporan-hki.pdf'

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)

      toast.success(`Laporan "${fileName}" berhasil diunduh.`, { id: toastId })
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal mengunduh PDF.'
      toast.error(msg, { id: toastId })
    } finally {
      setIsGenerating(false)
      setAgreed(false) // reset state
    }
  }

  const handleTrigger = (e: React.MouseEvent) => {
    e.preventDefault()
    setAgreed(false)
    setShowConsent(true)
  }

  return (
    <>
      <Button
        onClick={handleTrigger}
        disabled={isGenerating}
        className="gap-2 shadow-sm"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        {isGenerating ? 'Membuat PDF...' : 'Generate PDF'}
      </Button>

      <AlertDialog open={showConsent} onOpenChange={setShowConsent}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Peringatan Kerahasiaan Data
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-foreground mt-2 space-y-3">
                <p>
                  Data yang akan Anda akses dan/atau ekspor merupakan data internal yang bersifat <strong>terbatas</strong>.
                </p>
                <p>
                  Dilarang menyebarluaskan, menggandakan, atau memberikan data kepada pihak yang tidak memiliki kewenangan.
                </p>
                <p>
                  Dengan melanjutkan, Anda menyatakan telah memahami dan bertanggung jawab atas penggunaan data tersebut, dan aktivitas ini akan dicatat di dalam sistem (Berita Acara).
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-start space-x-2 py-4">
            <Checkbox
              id="consent"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label
              htmlFor="consent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Saya telah membaca dan memahami peringatan kerahasiaan data.
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={!agreed}
              onClick={(e) => {
                e.preventDefault() // prevent dialog from closing instantly if we want to show loading, but closing is fine too
                handleGenerate()
              }}
            >
              Setuju & Generate PDF
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
