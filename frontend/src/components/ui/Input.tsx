import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-secondary-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-lg border transition-colors duration-200
              ${leftIcon ? 'pl-10' : 'pl-4'} 
              ${rightIcon ? 'pr-10' : 'pr-4'} 
              py-2.5
              ${error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
              }
              focus:outline-none focus:ring-2 focus:ring-opacity-20
              disabled:bg-secondary-50 disabled:text-secondary-500
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-secondary-500">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
