export function getPasswordStrength(password: string): { label: string; width: string; color: string } {
  if (!password) return { label: 'Weak', width: '0%', color: 'bg-danger/50' }
  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/.test(password)
  const medium = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
  if (strong) return { label: 'Strong', width: '100%', color: 'bg-gold' }
  if (medium) return { label: 'Medium', width: '60%', color: 'bg-gold-mid' }
  return { label: 'Weak', width: '25%', color: 'bg-danger/50' }
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password)

  return (
    <div className="mt-2 flex items-center gap-2">
      <div
        className="h-1 grow overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={strength.width === '0%' ? 0 : strength.width === '25%' ? 25 : strength.width === '60%' ? 60 : 100}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Password strength: ${strength.label}`}
      >
        <div
          className={`h-full ${strength.color} transition-all duration-300 ease-out`}
          style={{ width: password ? strength.width : '0%' }}
        />
      </div>
      <span className="min-w-[46px] text-xs font-medium text-ink-muted">
        {password ? strength.label : 'Weak'}
      </span>
    </div>
  )
}
