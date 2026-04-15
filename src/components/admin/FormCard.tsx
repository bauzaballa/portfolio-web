import type { ReactNode } from 'react'

interface FormCardProps {
  children: ReactNode
}

export function FormCard({ children }: FormCardProps) {
  return <div className="admin-form-card">{children}</div>
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="admin-form-card__grid">{children}</div>
}

export function FormGroupLabel({ children }: { children: ReactNode }) {
  return <div className="admin-form-card__group-label">{children}</div>
}

export function FormDivider() {
  return <hr className="admin-form-card__divider" />
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="admin-form-card__actions">{children}</div>
}
