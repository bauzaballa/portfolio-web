import type { ChangeEvent } from 'react'

interface BaseProps {
  label: string
  className?: string
}

interface InputProps extends BaseProps {
  type?: 'text' | 'number' | 'date'
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  disabled?: boolean
  min?: number
  max?: number
}

export function AdminInput({
  label, type = 'text', value, onChange, placeholder, disabled, min, max, className = '',
}: InputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(type === 'number' ? +e.target.value : e.target.value)
  }

  const increment = () => {
    const n = typeof value === 'number' ? value : +value
    if (max !== undefined && n >= max) return
    onChange(n + 1)
  }

  const decrement = () => {
    const n = typeof value === 'number' ? value : +value
    if (min !== undefined && n <= min) return
    onChange(n - 1)
  }

  return (
    <div className={`admin-field ${className}`}>
      <label className="admin-field__label">{label}</label>
      {type === 'number' ? (
        <div className="admin-field__number-wrap">
          <input
            className="admin-field__input"
            type="number"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
          />
          <div className="admin-field__spinner">
            <button type="button" className="admin-field__spinner-btn" onClick={increment} tabIndex={-1}>
              &#9650;
            </button>
            <button type="button" className="admin-field__spinner-btn" onClick={decrement} tabIndex={-1}>
              &#9660;
            </button>
          </div>
        </div>
      ) : (
        <input
          className="admin-field__input"
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  )
}

interface SelectProps extends BaseProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

export function AdminSelect({ label, value, onChange, options, className = '' }: SelectProps) {
  return (
    <div className={`admin-field ${className}`}>
      <label className="admin-field__label">{label}</label>
      <select
        className="admin-field__select"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

interface TextareaProps extends BaseProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export function AdminTextarea({ label, value, onChange, placeholder, rows, className = '' }: TextareaProps) {
  return (
    <div className={`admin-field ${className}`}>
      <label className="admin-field__label">{label}</label>
      <textarea
        className="admin-field__textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={rows ? { minHeight: rows * 24 } : undefined}
      />
    </div>
  )
}

interface ToggleProps extends BaseProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function AdminToggle({ label, checked, onChange, className = '' }: ToggleProps) {
  return (
    <div
      className={`admin-toggle ${checked ? 'admin-toggle--active' : ''} ${className}`}
      onClick={() => onChange(!checked)}
    >
      <div className="admin-toggle__track">
        <div className="admin-toggle__thumb" />
      </div>
      {label}
    </div>
  )
}

interface BilingualInputProps {
  labelEn: string
  labelEs: string
  valueEn: string
  valueEs: string
  onChangeEn: (value: string) => void
  onChangeEs: (value: string) => void
  placeholder?: string
  className?: string
}

export function BilingualInput({
  labelEn, labelEs, valueEn, valueEs, onChangeEn, onChangeEs, placeholder, className = '',
}: BilingualInputProps) {
  return (
    <div className={`admin-bilingual ${className}`}>
      <AdminInput label={labelEn} value={valueEn} onChange={v => onChangeEn(String(v))} placeholder={placeholder} />
      <AdminInput label={labelEs} value={valueEs} onChange={v => onChangeEs(String(v))} placeholder={placeholder} />
    </div>
  )
}

interface BilingualTextareaProps {
  labelEn: string
  labelEs: string
  valueEn: string
  valueEs: string
  onChangeEn: (value: string) => void
  onChangeEs: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function BilingualTextarea({
  labelEn, labelEs, valueEn, valueEs, onChangeEn, onChangeEs, placeholder, rows, className = '',
}: BilingualTextareaProps) {
  return (
    <div className={`admin-bilingual ${className}`}>
      <AdminTextarea label={labelEn} value={valueEn} onChange={onChangeEn} placeholder={placeholder} rows={rows} />
      <AdminTextarea label={labelEs} value={valueEs} onChange={onChangeEs} placeholder={placeholder} rows={rows} />
    </div>
  )
}
