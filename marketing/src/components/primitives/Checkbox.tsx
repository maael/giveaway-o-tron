import React, { Dispatch, HTMLAttributes, SetStateAction } from 'react'
import { FaCheck, FaTimes } from 'react-icons/fa'

export default function Checkbox<T>({
  value,
  onChange,
  name,
  ...btnProps
}: Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  value?: boolean
  name: string
  onChange: Dispatch<SetStateAction<T>>
}) {
  return (
    <button onClick={() => onChange((v) => ({ ...v, [name]: !v[name] }))} {...btnProps}>
      {value ? <FaCheck /> : <FaTimes />}
    </button>
  )
}
