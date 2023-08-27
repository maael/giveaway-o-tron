import React, { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'

enum ModalState {
  Open = 'open',
  Closed = 'closed',
}

export function useModal() {
  const [state, setState] = useState(ModalState.Closed)

  return useMemo(
    () => ({
      isOpen: state === ModalState.Open,
      close: () => setState(ModalState.Closed),
      open: () => setState(ModalState.Open),
    }),
    [state]
  )
}

export function Modal({ isOpen, close, children }: React.PropsWithChildren<{ isOpen: Boolean; close: () => void }>) {
  return isOpen
    ? createPortal(
        <div onClick={close} className="bg-opacity-75 bg-black inset-0 fixed z-50 flex justify-center items-center">
          <div className="py-5 px-8 bg-gray-700 rounded-md flex flex-col justify-center gap-2 drop-shadow-lg">
            {children}
          </div>
        </div>,
        document.body
      )
    : null
}
