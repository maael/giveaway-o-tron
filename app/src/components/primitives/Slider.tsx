import React from 'react'
import { Range, getTrackBackground } from 'react-range'

export default function Slider({
  value,
  label,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (val: number) => void
}) {
  const values = [value]
  return (
    <div className="flex-1 px-3">
      <div>
        {label}: {values[0]}
      </div>
      <div className="mt-3 mb-4">
        <Range
          min={min}
          max={max}
          step={1}
          values={values}
          onChange={(values) => onChange(values[0])}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '6px',
                width: '100%',
                borderRadius: '4px',
                background: getTrackBackground({
                  values,
                  colors: ['#7c3aed', '#9ca3af'],
                  min,
                  max,
                  rtl: false,
                }),
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '20px',
                width: '20px',
                borderRadius: '4px',
                backgroundColor: '#FFF',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0px 2px 6px #AAA',
              }}
            />
          )}
        />
      </div>
    </div>
  )
}
