'use client'
import { useEffect } from 'react'
import { lenisInstance } from '@/components/ui/SmoothScroll'

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      lenisInstance?.stop()
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      lenisInstance?.start()
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      lenisInstance?.start()
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isLocked])
}
