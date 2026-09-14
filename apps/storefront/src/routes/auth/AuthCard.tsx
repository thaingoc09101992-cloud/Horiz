import type { FormEvent, ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { useSeoMeta } from '../../lib/seo'

interface AuthCardProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footerText: string
  footerLink: string
  footerLabel: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  belowCard?: ReactNode
}

export function AuthCard(props: AuthCardProps) {
  const { pathname } = useLocation()
  // Login/register/password-recovery screens have no search intent — noindex.
  useSeoMeta({ title: props.title + ' | HORIZ', description: props.description, path: pathname, noindex: true })

  return (
    <main className="auth-page" id="main-content">
      <section className="auth-art" aria-hidden="true">
        <div className="auth-art__ring" />
        <p>HORIZ / MEMBERS</p>
        <blockquote>“Mỗi hành trình bắt đầu bằng một bước vừa vặn.”</blockquote>
      </section>
      <section className="auth-panel">
        <form className="auth-card" onSubmit={props.onSubmit}>
          <p className="eyebrow">{props.eyebrow}</p>
          <h1>{props.title}</h1>
          <p className="auth-card__description">{props.description}</p>
          {props.children}
          <p className="auth-card__footer">
            {props.footerText} <Link to={props.footerLink}>{props.footerLabel}</Link>
          </p>
        </form>
        {props.belowCard}
      </section>
    </main>
  )
}
