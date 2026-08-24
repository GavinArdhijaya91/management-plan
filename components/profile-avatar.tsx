import { getProfileAssetUrl } from '@/lib/profile/assets'

interface ProfileAvatarProps {
  avatarPath?: string | null
  displayName: string
  online?: boolean
  showPresence?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'size-8 rounded-lg text-xs',
  md: 'size-10 rounded-xl text-sm',
  lg: 'size-24 rounded-2xl text-2xl',
}

export function ProfileAvatar({
  avatarPath,
  displayName,
  online = false,
  showPresence = false,
  size = 'md',
}: ProfileAvatarProps) {
  const avatarUrl = getProfileAssetUrl(avatarPath)
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <span
      className="relative inline-flex shrink-0"
      role="img"
      aria-label={showPresence ? `${displayName}, ${online ? 'online' : 'offline'}` : displayName}
    >
      <span
        className={`grid overflow-hidden border border-zinc-200 bg-zinc-100 font-semibold text-zinc-600 ${sizeClass[size]}`}
      >
        {avatarUrl ? (
          // Storage validates image MIME types and ownership before this public URL is persisted.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="m-auto" aria-hidden="true">
            {initials || '?'}
          </span>
        )}
      </span>
      {showPresence && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white ${online ? 'bg-emerald-500' : 'bg-zinc-300'}`}
          aria-hidden="true"
        />
      )}
    </span>
  )
}
