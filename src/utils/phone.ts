/** Normalize phone to digits only (RF/RB: 7… or 375…). */
export function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, '')

  if (digits.startsWith('8') && digits.length === 11) {
    digits = `7${digits.slice(1)}`
  }

  return digits
}

export function isValidPhone(digits: string): boolean {
  return (
    (digits.startsWith('7') && digits.length === 11) ||
    (digits.startsWith('375') && digits.length === 12)
  )
}

export function formatPhoneDisplay(digits: string): string {
  if (digits.startsWith('7') && digits.length === 11) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }

  if (digits.startsWith('375') && digits.length === 12) {
    return `+375 ${digits.slice(3, 5)} ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`
  }

  return `+${digits}`
}
