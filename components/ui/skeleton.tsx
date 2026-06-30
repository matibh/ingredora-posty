// Base Skeleton component
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#2a3441] ${className}`}
    />
  )
}
