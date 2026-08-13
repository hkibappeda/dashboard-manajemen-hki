'use client'

import React, { useState } from 'react'
import { Upload, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface VerifyFileUploaderProps {
  originalHash: string
}

export function VerifyFileUploader({ originalHash }: VerifyFileUploaderProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setStatus('invalid')
      setErrorMessage('File harus berupa PDF.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const fileHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      if (fileHashHex === originalHash) {
        setStatus('valid')
      } else {
        setStatus('invalid')
        setErrorMessage('Sidik jari digital tidak cocok. File ini telah dimodifikasi atau merupakan dokumen yang berbeda.')
      }
    } catch (error) {
      console.error('Error hashing file:', error)
      setStatus('invalid')
      setErrorMessage('Gagal memverifikasi file. Browser Anda mungkin tidak mendukung fitur kriptografi ini.')
    }
  }

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Cek Keaslian Softcopy PDF</h3>
      <p className="text-xs text-slate-500 mb-4">
        Jika Anda menerima dokumen ini dalam bentuk file digital (PDF), unggah di sini untuk mengecek apakah file tersebut masih 100% asli dan belum diedit (Anti-Manipulasi). File diproses aman di perangkat Anda tanpa dikirim ke server.
      </p>

      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors">
        {status === 'loading' ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-slate-600">Mengecek Integritas File...</p>
          </div>
        ) : status === 'valid' ? (
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-emerald-700">DOKUMEN 100% ASLI</p>
            <p className="text-xs text-emerald-600 mt-1">
              File identik dengan versi server. Tidak ada manipulasi.
            </p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 text-xs text-blue-600 underline"
            >
              Cek file lain
            </button>
          </div>
        ) : status === 'invalid' ? (
          <div className="flex flex-col items-center text-center">
            <XCircle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-sm font-bold text-destructive">FILE TIDAK VALID / PALSU</p>
            <p className="text-xs text-destructive/80 mt-1">
              {errorMessage}
            </p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 text-xs text-blue-600 underline"
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center cursor-pointer text-center">
            <Upload className="h-8 w-8 text-slate-400 mb-2 mx-auto" />
            <span className="text-sm font-medium text-blue-600">Pilih File PDF Laporan</span>
            <span className="text-xs text-slate-500 mt-1 block">Maksimal 10MB</span>
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>
        )}
      </div>
    </div>
  )
}
