import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }
>

export function Button({ variant = 'primary', children, className = '', ...rest }: Props) {
  const base = 'btn'
  const classes = [base, variant === 'secondary' ? 'btn--secondary' : ''].join(' ').trim()
  return (
    <button className={`${classes} ${className}`.trim()} {...rest}>
      {children}
    </button>
  )
}


