import type { InputHTMLAttributes, PropsWithChildren } from 'react'

type Props = PropsWithChildren<InputHTMLAttributes<HTMLInputElement>>

export function Checkbox({ children, className = '', ...rest }: Props) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <input type="checkbox" className={className} {...rest} />
      {children ? <span>{children}</span> : null}
    </label>
  )
}


