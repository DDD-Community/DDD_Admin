import { HttpResponse, http } from "msw"

import type {
  BookingContext,
  BookingReservation,
  BookingSlot,
} from "@/pages/interview-booking/types"

/**
 * 지원자 셀프 예약 API 목 핸들러 — 실제 예약 토큰 없이 `/interview?token=<시나리오>` 로
 * 화면 상태를 확인하기 위한 것이다. 토큰 값이 곧 시나리오 이름이다.
 *
 * - `ok`         정상 (슬롯 4개, 그중 1개 마감)
 * - `reserved`   이미 예약된 지원자 → 확정 화면
 * - `full`       전부 마감
 * - `empty`      열린 슬롯 없음
 * - `expired`    401
 * - `ineligible` 403
 * - 그 외        500
 *
 * POST 는 slotId 로 분기한다: 2 → SLOT_FULL(409), 3 → RESERVATION_EXISTS(409), 그 외 201.
 */
const BASE = "/api/v1/interview-bookings"

function success<T>(data: T, status = 200) {
  return HttpResponse.json({ code: "SUCCESS", message: "", data }, { status })
}

function failure(code: string, message: string, status: number) {
  return HttpResponse.json({ code, message }, { status })
}

function isoAtKst(date: string, time: string): string {
  return new Date(`${date}T${time}:00+09:00`).toISOString()
}

const SLOTS: BookingSlot[] = [
  {
    id: 1,
    startAt: isoAtKst("2026-09-12", "14:00"),
    endAt: isoAtKst("2026-09-12", "14:40"),
    location: "강남 스터디룸 A",
    remainingSeats: 2,
  },
  {
    id: 2,
    startAt: isoAtKst("2026-09-12", "15:00"),
    endAt: isoAtKst("2026-09-12", "15:40"),
    location: "강남 스터디룸 A",
    remainingSeats: 1,
  },
  {
    id: 3,
    startAt: isoAtKst("2026-09-13", "10:00"),
    endAt: isoAtKst("2026-09-13", "10:40"),
    location: "온라인 (Google Meet)",
    remainingSeats: 3,
  },
  {
    id: 4,
    startAt: isoAtKst("2026-09-13", "23:30"),
    endAt: isoAtKst("2026-09-14", "00:10"),
    location: "온라인 (Google Meet)",
    remainingSeats: 0,
  },
]

const RESERVATION: BookingReservation = {
  id: 100,
  slotId: 1,
  startAt: SLOTS[0].startAt,
  endAt: SLOTS[0].endAt,
  location: SLOTS[0].location,
}

function readScenario(request: Request): string {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? ""
}

/** slotId 3 으로 경합(409 RESERVATION_EXISTS)을 겪은 뒤에는 context 재조회가 예약 있음으로 응답한다. */
let hasRacedReservation = false

const CONTEXT_BY_SCENARIO: Record<string, () => Response> = {
  ok: () =>
    success<BookingContext>({
      applicantName: "장원석",
      partName: "FE",
      reservation: hasRacedReservation ? { ...RESERVATION, slotId: 3 } : null,
    }),
  full: () =>
    success<BookingContext>({
      applicantName: "장원석",
      partName: "FE",
      reservation: null,
    }),
  empty: () =>
    success<BookingContext>({
      applicantName: "장원석",
      partName: "FE",
      reservation: null,
    }),
  reserved: () =>
    success<BookingContext>({
      applicantName: "장원석",
      partName: "FE",
      reservation: RESERVATION,
    }),
  expired: () =>
    failure("INTERVIEW_BOOKING_TOKEN_EXPIRED", "링크가 만료되었습니다", 401),
  ineligible: () =>
    failure("INTERVIEW_BOOKING_NOT_ELIGIBLE", "예약 대상이 아닙니다", 403),
}

const SLOTS_BY_SCENARIO: Record<string, () => Response> = {
  ok: () => success(SLOTS),
  full: () => success(SLOTS.map((slot) => ({ ...slot, remainingSeats: 0 }))),
  empty: () => success<BookingSlot[]>([]),
  expired: () =>
    failure("INTERVIEW_BOOKING_TOKEN_EXPIRED", "링크가 만료되었습니다", 401),
  ineligible: () =>
    failure("INTERVIEW_BOOKING_NOT_ELIGIBLE", "예약 대상이 아닙니다", 403),
}

const RESERVE_BY_SLOT_ID: Record<number, () => Response> = {
  2: () => failure("INTERVIEW_SLOT_FULL", "정원이 가득 찼습니다", 409),
  3: () => {
    hasRacedReservation = true
    return failure("INTERVIEW_RESERVATION_EXISTS", "이미 예약이 있습니다", 409)
  },
}

export const interviewBookingHandlers = [
  http.get(`${BASE}/context`, ({ request }) => {
    const respond = CONTEXT_BY_SCENARIO[readScenario(request)]
    return respond ? respond() : failure("INTERNAL_ERROR", "서버 오류", 500)
  }),
  http.get(`${BASE}/slots`, ({ request }) => {
    const respond = SLOTS_BY_SCENARIO[readScenario(request)]
    return respond ? respond() : failure("INTERNAL_ERROR", "서버 오류", 500)
  }),
  http.post(`${BASE}/reservations`, async ({ request }) => {
    const { slotId } = (await request.json()) as { slotId: number }
    const respond = RESERVE_BY_SLOT_ID[slotId]
    if (respond) return respond()
    return success<BookingReservation>({ id: 101, slotId }, 201)
  }),
]
