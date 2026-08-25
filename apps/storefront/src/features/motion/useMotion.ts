import { useEffect, useState, type RefObject } from 'react'

const EXIT_DURATION_MS = 240

export function useDelayedUnmount(open: boolean) {
  const [mounted, setMounted] = useState(open)

  if (open && !mounted) setMounted(true)

  useEffect(() => {
    if (open || !mounted) return

    const timeoutId = window.setTimeout(() => setMounted(false), EXIT_DURATION_MS)
    return () => window.clearTimeout(timeoutId)
  }, [mounted, open])

  return mounted
}

export function useRevealMotion(scopeRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const scope = scopeRef.current
    if (!scope) return

    const revealElements = Array.from(scope.querySelectorAll<HTMLElement>('[data-reveal]'))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -8%', threshold: 0.12 })

    revealElements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [scopeRef])
}

export function useHeroParallax(scopeRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const scope = scopeRef.current
    const hero = scope?.querySelector<HTMLElement>('.ab-hero')
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frameId = 0
    const update = () => {
      frameId = 0
      const rect = hero.getBoundingClientRect()
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)))
      hero.style.setProperty('--hero-image-y', `${(progress * 3.5).toFixed(2)}%`)
      hero.style.setProperty('--hero-image-scale', (1.025 + progress * 0.035).toFixed(3))
      hero.style.setProperty('--hero-copy-y', `${(progress * -18).toFixed(2)}px`)
    }
    const requestUpdate = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    return () => {
      window.removeEventListener('scroll', requestUpdate)
      if (frameId) window.cancelAnimationFrame(frameId)
      hero.style.removeProperty('--hero-image-y')
      hero.style.removeProperty('--hero-image-scale')
      hero.style.removeProperty('--hero-copy-y')
    }
  }, [scopeRef])
}
