import { Skeleton } from './skeleton'

export default function UploadSkeleton() {
  return (
    <div className="flex-1" style={{ backgroundColor: '#181E26' }}>
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-3.5 w-36" />
        </nav>

        {/* Title block */}
        <div className="mb-10 space-y-3">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        {/* Main card */}
        <div
          className="p-8 rounded-3xl space-y-8"
          style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}
        >
          {/* Dropzone area */}
          <div
            className="rounded-2xl py-20 flex flex-col items-center gap-4"
            style={{ border: '2px dashed #334155', backgroundColor: '#181E26' }}
          >
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-7 w-44 rounded-full" />
          </div>

          {/* Metadata fields */}
          <div className="border-t border-[#334155] pt-6 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-12" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>

            {/* Tags + Privacy row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* Client selector section */}
          <div className="border-t border-[#334155] pt-6 space-y-4">
            <Skeleton className="h-6 w-52" />
            {[1, 2].map(i => (
              <div
                key={i}
                className="p-4 rounded-xl"
                style={{ backgroundColor: '#181E26', border: '1px solid #334155' }}
              >
                <div className="flex items-center gap-3 pb-3 border-b border-[#334155]/40 mb-3">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
                <div className="grid grid-cols-2 gap-3 pl-7">
                  {[1, 2].map(j => (
                    <Skeleton key={j} className="h-12 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <Skeleton className="mt-8 h-14 w-full rounded-2xl" />

      </main>
    </div>
  )
}
