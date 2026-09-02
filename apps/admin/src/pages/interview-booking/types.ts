/** BE `GET /interview-bookings/slots` 항목. `remainingSeats === 0` 이면 마감이지만 목록에는 포함된다. */
export interface BookingSlot {
  id: number
  /** UTC ISO. 화면 표기는 항상 KST 로 고정한다 (`lib/slotGroups.ts`) */
  startAt: string
  endAt: string
  location?: string
  remainingSeats: number
}

/** BE DTO 가 slot 관계에서 채우는 optional 필드라 예약 직후 응답에는 비어 있을 수 있다. */
export interface BookingReservation {
  id: number
  slotId: number
  startAt?: string
  endAt?: string
  location?: string
}

export interface BookingContext {
  applicantName: string
  partName: string
  reservation: BookingReservation | null
}

/** 예약 화면 대신 안내 문구만 보여주는 상태 (`constants.ts` 의 `NOTICE_TEXT` 키) */
export type BookingNoticeStatus =
  "invalid" | "expired" | "ineligible" | "failed"

/** 확정 요청이 인증 사유로 막혀 예약 화면을 더 이상 보여줄 수 없는 상태 */
export type BookingBlockedStatus = Extract<
  BookingNoticeStatus,
  "expired" | "ineligible"
>
