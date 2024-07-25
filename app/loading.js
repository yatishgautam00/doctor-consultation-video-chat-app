import { Skeleton } from "@/components/ui/skeleton"
export default function Loading() {
    return (
      <div className="flex flex-col space-y-3 p-20 ">
      <Skeleton className="h-[125px] w-[250px] rounded-xl bg-slate-200" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px] bg-slate-300" />
        <Skeleton className="h-4 w-[200px] bg-slate-300" />
      </div>
    </div>
    )
  }
  