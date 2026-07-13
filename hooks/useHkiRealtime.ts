'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useQueryClient } from '@tanstack/react-query'
import { useDebouncedCallback } from 'use-debounce'

export function useHkiRealtime() {
  const queryClient = useQueryClient()
  const invalidateHkiData = useDebouncedCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['hkiData'] })
  }, 1500)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('hki_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hki' },
        (payload) => {
          console.log('Perubahan realtime terdeteksi:', payload)
          invalidateHkiData()
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [invalidateHkiData])
}
