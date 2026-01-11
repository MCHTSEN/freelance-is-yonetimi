import { useEffect, useState } from 'react'

interface FormattedPriceInputProps {
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
  required?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
  disabled?: boolean
}

export default function FormattedPriceInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  id,
  required,
  min,
  max,
  step,
  disabled
}: FormattedPriceInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Format value on initial load or prop change
  useEffect(() => {
    if (value === undefined || value === null || value === '') {
      setDisplayValue('')
      return
    }

    const numericValue = typeof value === 'string' ? value.replace(/[^0-9.]/g, '') : value.toString()
    if (numericValue === '') {
      setDisplayValue('')
      return
    }

    const parts = numericValue.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    setDisplayValue(parts.join(','))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value

    // Allow only numbers, dots and commas
    input = input.replace(/[^0-9.,]/g, '')

    // Handle Turkish format: dots for thousands, comma for decimal
    // Convert to standard numeric string: remove dots, change comma to dot
    const standardNumeric = input.replace(/\./g, '').replace(',', '.')
    
    // Check if it's a valid number format (e.g., skip if multiple commas)
    if (input.split(',').length > 2) return

    onChange(standardNumeric)
  }

  const handleBlur = () => {
    if (!displayValue) return
    
    // Ensure it looks clean on blur
    const standardNumeric = displayValue.replace(/\./g, '').replace(',', '.')
    const num = parseFloat(standardNumeric)
    if (!isNaN(num)) {
      onChange(num.toString())
    }
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      required={required}
      disabled={disabled}
    />
  )
}
