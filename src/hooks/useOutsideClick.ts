import { useEffect, useRef } from 'react'

export function useOutsideClick<T extends HTMLElement>(onOutsideClick: () => void) {
  const ref = useRef<T>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [onOutsideClick])

  return ref
}
