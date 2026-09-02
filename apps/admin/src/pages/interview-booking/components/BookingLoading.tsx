import { Spinner } from "@heroui/react"

export function BookingLoading() {
  return (
    <div className="mt-16 flex w-full flex-col items-center gap-4 md:mt-28">
      <Spinner aria-label="예약 정보 불러오는 중" />
      <p className="text-base font-medium text-gray-900">불러오는 중이에요…</p>
    </div>
  )
}
