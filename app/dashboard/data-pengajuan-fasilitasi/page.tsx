// app/dashboard/data-pengajuan-fasilitasi/page.tsx
import { createClient } from '@/utils/supabase/server'
import { HKIClientPage } from './hki-client-page'
import { cookies } from 'next/headers'
import { FormOptions } from '@/lib/types'
import { Database } from '@/lib/database.types'
import { cache } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

export const revalidate = 3600

type PengusulOptionRaw = { id_pengusul: number; nama_opd: string };
type KelasOptionRaw = { id_kelas: number; nomor_kelas: number; nama_kelas: string; tipe: string; is_active: boolean };

const getFormOptions = cache(async (supabase: SupabaseClient<Database>): Promise<FormOptions> => {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_form_options');

    if (rpcError) throw rpcError;

    const jenisData = rpcData?.jenis_options || [];
    const statusData = rpcData?.status_options || [];
    const pengusulData = (rpcData?.pengusul_options || []) as PengusulOptionRaw[];
    const kelasData = (rpcData?.kelas_options || []) as KelasOptionRaw[];

    return {
      jenisOptions: jenisData,
      statusOptions: statusData,
      tahunOptions: rpcData?.tahun_options || [],
      pengusulOptions: pengusulData.map((p) => ({
        value: String(p.id_pengusul),
        label: p.nama_opd,
      })),
      kelasOptions: kelasData.map((k) => ({
        value: String(k.id_kelas),
        label: `Kelas ${k.nomor_kelas} (${k.tipe}) - "${k.nama_kelas}"`,
        is_active: k.is_active,
        nomor_kelas: k.nomor_kelas
      })),
    }
  } catch (error: any) {
    console.error('Gagal memuat form options:', error.message);
    throw new Error(`Gagal mengambil data prasyarat form: ${error.message}`);
  }
});

export default async function DataPengajuanPage() {
  const supabase = await createClient();

  let formOptions: FormOptions = {
    jenisOptions: [],
    statusOptions: [],
    tahunOptions: [],
    pengusulOptions: [],
    kelasOptions: [],
  };
  let pageError: string | null = null;

  try {
    formOptions = await getFormOptions(supabase);
  } catch (error) {
    console.error('Gagal memuat prasyarat halaman HKI:', error);
    pageError = error instanceof Error
        ? error.message
        : 'Terjadi kesalahan tidak dikenal saat memuat opsi filter.';
  }

  return <HKIClientPage formOptions={formOptions} error={pageError} />;
}