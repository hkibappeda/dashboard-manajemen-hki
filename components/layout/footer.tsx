// components/layout/footer.tsx
'use client'

import React from 'react'

interface FooterProps {
  companyName?: string
}

export function Footer({ companyName = 'Bappeda Sleman' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full shrink-0 border-t border-border bg-card px-4 py-4 text-center md:px-6 2xl:px-10">
      <p className="text-sm text-muted-foreground">
        &copy; {currentYear} {companyName}. Hak Cipta Dilindungi.
      </p>
    </footer>
  )
}
