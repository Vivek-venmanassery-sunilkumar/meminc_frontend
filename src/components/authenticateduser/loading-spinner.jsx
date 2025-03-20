import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingSpinner() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      {/* Header placeholder */}
      <div className="w-full h-16 bg-background border-b fixed top-0 z-50 flex items-center justify-between px-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      <div className="mt-20 w-full max-w-7xl mx-auto px-4">
        {/* Banner placeholder */}
        <Skeleton className="w-full h-[300px] rounded-lg mb-8" />

        {/* Loading indicator */}
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-medium text-muted-foreground">Loading your products...</h3>
        </div>

        {/* Product grid placeholders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {Array(8)
            .fill()
            .map((_, i) => (
              <div key={i} className="rounded-lg border overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full mt-4" />
                </div>
              </div>
            ))}
        </div>

        {/* Pagination placeholder */}
        <div className="flex justify-center mt-8 space-x-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}
