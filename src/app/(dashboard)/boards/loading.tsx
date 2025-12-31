import { BoardListSkeleton } from '@/components/ui/skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function BoardsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <BoardListSkeleton />
    </div>
  )
}

