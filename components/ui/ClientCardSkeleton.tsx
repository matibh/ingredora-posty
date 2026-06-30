import { Skeleton } from './skeleton'

// Mirrors the real client card structure exactly
export function ClientCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-[#334155] bg-[#232B36]">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 pb-4">
        {/* Avatar */}
        <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-2.5 w-1/3" />
        </div>
      </div>

      {/* Social platform badge icons */}
      <div className="px-5 pb-4 flex items-center gap-1.5 min-h-[36px]">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="w-7 h-7 rounded-lg" />
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex border-t border-[#334155]/60 mt-auto">
        <Skeleton className="flex-1 h-10 rounded-none rounded-bl-2xl" />
        <div className="w-[1px] bg-[#334155]/40" />
        <Skeleton className="flex-1 h-10 rounded-none rounded-br-2xl" />
      </div>
    </div>
  )
}
