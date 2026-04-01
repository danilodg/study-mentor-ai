type SessionLike = {
  user?: {
    email?: string | null
    user_metadata?: Record<string, unknown>
  }
} | null | undefined

export function getSessionDisplayName(session: SessionLike) {
  const metadata = session?.user?.user_metadata
  const fullName = typeof metadata?.full_name === 'string' ? metadata.full_name.trim() : ''
  const name = typeof metadata?.name === 'string' ? metadata.name.trim() : ''

  return fullName || name || ''
}

export function getSessionIdentity(session: SessionLike) {
  const displayName = getSessionDisplayName(session)
  const email = session?.user?.email?.trim() ?? ''

  return displayName || email || ''
}

export function truncateIdentity(value: string, maxLength = 20) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, Math.max(0, maxLength - 1))}…`
}
