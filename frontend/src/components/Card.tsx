import type { HTMLAttributes, PropsWithChildren } from 'react'

type Props = PropsWithChildren<HTMLAttributes<HTMLDivElement>>

export function Card({ children, className = '', ...rest }: Props) {
  return (
    <div className={`card ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}


