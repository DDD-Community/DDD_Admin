import { useSuspenseQuery } from "@tanstack/react-query"

import { BookingDoneCard } from "./components/BookingDoneCard"
import { BookingSlotSection } from "./components/BookingSlotSection"
import { bookingQueries } from "./lib/bookingQueries"

interface Props {
  token: string
}

/** 기존 예약이 있으면(재접속 포함) 항상 확정 화면, 없으면 슬롯 선택 화면. */
export function InterviewBookingContent({ token }: Props) {
  const { data: context } = useSuspenseQuery(bookingQueries.context(token))

  if (context.reservation) {
    return <BookingDoneCard reservation={context.reservation} />
  }

  return <BookingSlotSection token={token} context={context} />
}
