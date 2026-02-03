import { Fragment, ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  footer?: ReactNode
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  }

  return (
    <Fragment>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity" 
            onClick={onClose}
          />
          
          <div className={`relative bg-white rounded-xl shadow-2xl w-full ${sizes[size]} transform transition-all`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {children}
            </div>
            
            {footer && (
              <div className="px-6 py-4 border-t border-secondary-200 bg-secondary-50 rounded-b-xl">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  )
}
