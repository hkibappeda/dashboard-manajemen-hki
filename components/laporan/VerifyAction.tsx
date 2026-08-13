'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ShieldCheck } from 'lucide-react'
import { VerifyFileUploader } from './VerifyFileUploader'

interface VerifyActionProps {
  originalHash: string
}

export function VerifyAction({ originalHash }: VerifyActionProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50">
          <ShieldCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Cek File</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verifikasi Keaslian Dokumen</DialogTitle>
          <DialogDescription>
            Pengecekan anti-manipulasi menggunakan teknologi sidik jari digital (SHA-256).
          </DialogDescription>
        </DialogHeader>
        
        {/* Render VerifyFileUploader in standalone mode so it doesn't have double padding/borders */}
        <div className="pt-2">
          <VerifyFileUploader originalHash={originalHash} standalone={true} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
