import { Skeleton } from './skeleton'
import { ClientCardSkeleton } from './ClientCardSkeleton'

export default function DashboardSkeleton() {
  return (
    <div className="flex-1" style={{ backgroundColor: '#181E26' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Welcome banner skeleton */}
        <div
          className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 rounded-3xl"
          style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}
        >
          <div className="space-y-2.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-12 w-40 rounded-2xl flex-shrink-0" />
        </div>

        {/* Clients section header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>

        {/* Client cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {[1, 2, 3].map(i => (
            <ClientCardSkeleton key={i} />
          ))}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="p-6 rounded-2xl"
              style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}
            >
              <Skeleton className="w-12 h-12 rounded-xl mb-4" />
              <Skeleton className="h-3 w-28 mb-2" />
              <Skeleton className="h-7 w-20 mb-2" />
              <Skeleton className="h-2.5 w-36" />
            </div>
          ))}
        </div>

        {/* Recent jobs section */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}
        >
          <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: '#334155' }}>
            <Skeleton className="h-5 w-44" />
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid #334155', backgroundColor: '#181E26' }}
              >
                <Skeleton className="w-full aspect-video rounded-none" />
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                  <Skeleton className="h-2.5 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
