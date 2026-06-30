import { Skeleton } from './skeleton'

// Mirrors one expanded client accordion row on the accounts page
function AccountRowSkeleton() {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}
    >
      {/* Client header */}
      <div className="flex flex-wrap items-center justify-between p-6 gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-5 h-5 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export default function AccountsSkeleton() {
  return (
    <div className="flex-1" style={{ backgroundColor: '#181E26' }}>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-3.5 w-28" />
        </nav>

        {/* Title block */}
        <div className="mb-10 space-y-3">
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        {/* Client accordion rows */}
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <AccountRowSkeleton key={i} />
          ))}
          {/* "New client" footer button */}
          <div className="pt-2 flex justify-center">
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>

      </main>
    </div>
  )
}
