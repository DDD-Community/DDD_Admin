import { NO_INFO_PLACEHOLDER } from "../constants"
import { formatKstDateTime } from "../lib/slotGroups"
import type { BookingReservation } from "../types"

interface Props {
  reservation: BookingReservation | null
}

export function BookingDoneCard({ reservation }: Props) {
  const dateTimeText = reservation?.startAt
    ? formatKstDateTime(reservation.startAt)
    : NO_INFO_PLACEHOLDER
  const locationText = reservation?.location || NO_INFO_PLACEHOLDER

  return (
    <section className="mx-auto mt-10 flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-gray-200 px-5 py-8 text-center md:mt-20 md:px-8 md:py-10">
      <h1 className="text-2xl font-bold text-gray-900">예약이 확정되었어요</h1>
      <dl className="flex w-full flex-col gap-2 text-base">
        <div className="flex justify-center gap-2">
          <dt className="font-medium text-gray-500">일시</dt>
          <dd className="font-semibold text-gray-900">{dateTimeText}</dd>
        </div>
        <div className="flex justify-center gap-2">
          <dt className="font-medium text-gray-500">장소</dt>
          <dd className="font-semibold text-gray-900">{locationText}</dd>
        </div>
      </dl>
      <p className="text-sm font-medium text-gray-500">
        확정 안내 메일을 보내드렸어요(캘린더 초대 포함).
        <br />
        변경이 필요하면 운영진에게 문의해주세요.
      </p>
    </section>
  )
}
