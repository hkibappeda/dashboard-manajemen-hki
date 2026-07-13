//app/actions/hki-actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

const HKI_TABLE = 'hki'
const HKI_BUCKET = 'sertifikat-hki'

export async function bulkDeleteHKI(ids: number[]) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Tidak terautentikasi')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Akses ditolak. Hanya admin yang dapat menghapus data.')
    }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error('Daftar ID tidak valid atau kosong.')
    }
    const { data: entriesToDelete, error: fetchError } = await supabase
      .from(HKI_TABLE)
      .select('sertifikat_pdf')
      .in('id_hki', ids)

    if (fetchError) {
      console.error('Supabase fetch error (bulk-delete):', fetchError)
      throw new Error('Gagal mengambil data HKI untuk dihapus.')
    }
    const { error: deleteError } = await supabase
      .from(HKI_TABLE)
      .delete()
      .in('id_hki', ids)

    if (deleteError) {
      console.error('Supabase delete error (bulk-delete):', deleteError)
      throw new Error('Gagal menghapus entri HKI dari database.')
    }
    if (entriesToDelete && entriesToDelete.length > 0) {
      const filePaths = entriesToDelete
        .map((e) => e.sertifikat_pdf)
        .filter(Boolean) as string[]
        
      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(HKI_BUCKET)
          .remove(filePaths)
          
        if (storageError) {
          console.warn(
            'Gagal menghapus beberapa file dari storage:',
            storageError
          )
        }
      }
    }

    return {
      success: true,
      message: `${ids.length} entri berhasil dihapus.`,
      deletedIds: ids,
    }
  } catch (error: any) {
    console.error('Unexpected bulk delete error:', error)
    throw new Error(error.message || 'Terjadi kesalahan pada server.')
  }
}
