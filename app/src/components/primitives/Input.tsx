import cls from 'classnames'
import React, { HTMLAttributes } from 'react'

export default function Input({
  label,
  title,
  outerClassName,
  ...inputProps
}: HTMLAttributes<HTMLInputElement> & { label: string; value?: string; outerClassName?: string }) {
  return (
    <div className={cls(outerClassName, 'flex flex-row justify-center items-center flex-1')}>
      <div className="flex-0 bg-purple-600 px-2 py-1 rounded-l-md h-full" title={title}>
        {label}
      </div>
      <input
        className="bg-gray-700 px-2 py-1 rounded-r-md border-b border-purple-500 flex-1 h-full overflow-ellipsis"
        {...inputProps}
      />
    </div>
  )
}
