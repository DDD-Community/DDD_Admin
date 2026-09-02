import type { BookingContext, BookingReservation, BookingSlot } from "../types"

/**
 * 지원자 셀프 예약 API 는 `@ddd/api` 싱글턴을 쓰지 않는다.
 *
 * 싱글턴은 운영진 쿠키 세션 전제로 configure 돼 있고 401 이면 `onUnauthorized` 가
 * 로그인 페이지로 강제 이동시킨다(`main.tsx`). 지원자 링크의 토큰 만료도 401 이라
 * 같은 클라이언트를 타면 "링크 만료" 안내 대신 운영진 로그인 화면이 떠 버린다.
 * 그래서 이 페이지만 Bearer 헤더로 직접 fetch 하며, base URL 은 어드민과 같은
 * 오리진(`VITE_API_URL` 미설정 시 상대 경로)이다.
 */
const API_BASE_PATH = "/api/v1/interview-bookings"

interface ApiEnvelope<T> {
  code?: string
  message?: string
  data?: T
}

export class BookingApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = "BookingApiError"
    this.code = code
    this.status = status
  }
}

const UNKNOWN_ERROR_MESSAGE = "알 수 없는 오류가 발생했어요."

function resolveBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? ""
}

async function parseEnvelope<T>(
  response: Response
): Promise<ApiEnvelope<T> | null> {
  try {
    return (await response.json()) as ApiEnvelope<T>
  } catch {
    return null
  }
}

async function request<T>(
  path: string,
  token: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const response = await fetch(`${resolveBaseUrl()}${API_BASE_PATH}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  })

  const envelope = await parseEnvelope<T>(response)

  if (!response.ok) {
    throw new BookingApiError(
      envelope?.code ?? "UNKNOWN_ERROR",
      envelope?.message ?? UNKNOWN_ERROR_MESSAGE,
      response.status
    )
  }

  if (envelope?.data == null) {
    throw new BookingApiError(
      "UNKNOWN_ERROR",
      UNKNOWN_ERROR_MESSAGE,
      response.status
    )
  }

  return envelope.data
}

export function fetchBookingContext(token: string): Promise<BookingContext> {
  return request<BookingContext>("/context", token)
}

export function fetchBookingSlots(token: string): Promise<BookingSlot[]> {
  return request<BookingSlot[]>("/slots", token)
}

/** 성공 시 HTTP 201. 경합·마감은 `BookingApiError.code` 로 구분한다. */
export function createBookingReservation(
  token: string,
  slotId: number
): Promise<BookingReservation> {
  return request<BookingReservation>("/reservations", token, {
    method: "POST",
    body: { slotId },
  })
}
