import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  headerAction?: ReactNode
  footer?: ReactNode
  noPadding?: boolean
  onClick?: () => void
}

export default function Card({ children, className = '', title, subtitle, headerAction, footer, noPadding, onClick }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-secondary-200 ${className}`} onClick={onClick}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
          <div>
            {title && <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>}
            {subtitle && <p className="text-sm text-secondary-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-secondary-200 bg-secondary-50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  )
}
