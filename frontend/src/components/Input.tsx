import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement>

export function Input(props: Props) {
  const { className = '', ...rest } = props
  return <input className={`input ${className}`.trim()} {...rest} />
}


