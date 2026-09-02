import { mutationOptions, queryOptions } from "@tanstack/react-query"

import {
  BookingApiError,
  createBookingReservation,
  fetchBookingContext,
  fetchBookingSlots,
} from "./bookingApi"

/**
 * 쿼리/뮤테이션 팩토리는 원래 `packages/api` 에 두지만(CODE_RULES §2.1), 이 API 는
 * 쿠키 세션이 아닌 Bearer 예약 토큰 인증이라 그쪽 싱글턴에 얹을 수 없다
 * (`bookingApi.ts` 상단 참조). 소비자가 이 페이지 하나뿐이므로 페이지에 콜로케이션한다.
 */
export const bookingKeys = {
  all: ["interview-booking"] as const,
  context: (token: string) => [...bookingKeys.all, "context", token] as const,
  slots: (token: string) => [...bookingKeys.all, "slots", token] as const,
}

/** 401/403 은 재시도해도 결과가 같고 안내 화면만 늦어지므로 즉시 실패시킨다. */
function isBlockedByAuth(error: unknown): boolean {
  return (
    error instanceof BookingApiError &&
    (error.status === 401 || error.status === 403)
  )
}

function retryUnlessBlocked(failureCount: number, error: unknown): boolean {
  return !isBlockedByAuth(error) && failureCount < 1
}

export const bookingQueries = {
  context: (token: string) =>
    queryOptions({
      queryKey: bookingKeys.context(token),
      queryFn: () => fetchBookingContext(token),
      retry: retryUnlessBlocked,
    }),
  slots: (token: string) =>
    queryOptions({
      queryKey: bookingKeys.slots(token),
      queryFn: () => fetchBookingSlots(token),
      retry: retryUnlessBlocked,
      // 잔여석은 다른 지원자의 예약으로 수시로 바뀐다 — 탭 복귀 때마다 새로 받는다.
      staleTime: 0,
    }),
}

interface CreateReservationVariables {
  token: string
  slotId: number
}

export const bookingMutations = {
  createReservation: () =>
    mutationOptions({
      mutationFn: ({ token, slotId }: CreateReservationVariables) =>
        createBookingReservation(token, slotId),
    }),
}
