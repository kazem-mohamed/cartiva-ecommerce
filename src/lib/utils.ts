type ClassValue = string | number | null | undefined | false

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}
