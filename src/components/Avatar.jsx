import { avatarColor, initials } from '../utils/format'

export default function Avatar({ name, seed, size = 'md' }) {
  const sizes = { sm: 'h-10 w-10 text-sm', md: 'h-12 w-12 text-base' }
  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
      style={{ backgroundColor: avatarColor(seed || name) }}
    >
      {initials(name)}
    </div>
  )
}
