/**
 * 면접 슬롯 지원자 셀프 예약 API.
 *
 * 이 모듈은 `@ddd/api` 싱글턴을 쓰지 않는다. 예약 API 는 메일 링크에 담긴
 * **Bearer 예약 토큰** 인증인데, `@ddd/api` 는 `lib/api/config.ts` 의
 * `ensureApiConfigured` 로 쿠키 세션(`credentials: "include"`) 전제로 configure 돼
 * 있어 같은 클라이언트에 Bearer 경로를 얹으면 인증 방식이 둘로 갈린다. 또한 이 BE
 * 계약(DDD_BE#87)이 아직 머지 전이라 `pnpm gen:api` 로 타입을 뽑을 수도 없다.
 * 그래서 이 파일은 로컬 fetch 모듈로 수기 타입을 둔다 — BE 머지 후 openapi 에
 * 공개 API 가 올라오면 생성 타입으로 교체하되 호출부 시그니처는 유지한다.
 * (설계 §4: docs/superpowers/specs/2026-09-01-web-interview-booking-design.md)
 *
 * base URL 이 `window.location.origin` 을 폴백으로 참조하므로 **클라이언트 전용**이다.
 * 서버 컴포넌트/서버 액션에서 이 모듈을 import 하면 안 된다.
 */

export type BookingSlot = {
  id: number;
  startAt: string; // ISO. BE 가 Date 를 직렬화해 내려준다
  endAt: string;
  location?: string;
  remainingSeats: number; // 0 이면 마감 — 목록에는 포함된다
};

export type BookingReservation = {
  id: number;
  slotId: number;
  startAt?: string; // BE DTO 가 slot 관계에서 채우므로 optional
  endAt?: string;
  location?: string;
};

export type BookingContext = {
  applicantName: string;
  partName: string;
  reservation: BookingReservation | null;
};

type ApiEnvelope<T> = {
  code?: string;
  message?: string;
  data?: T;
};

const API_BASE_PATH = "/api/v1/interview-bookings";

export class BookingApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "BookingApiError";
    this.code = code;
    this.status = status;
  }
}

/** `NEXT_PUBLIC_API_URL` 이 없으면 현재 오리진으로 폴백한다 — 클라이언트에서만 호출된다. */
function resolveBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? window.location.origin;
}

/**
 * 예약 토큰(Bearer) 인증으로 BE 를 호출하는 공통 fetch 헬퍼.
 *
 * 쿠키가 필요 없으므로 `credentials` 를 지정하지 않는다(기본값 `same-origin`).
 * 응답이 `res.ok` 가 아니면 봉투를 파싱해 `BookingApiError` 를 던지고, 봉투 파싱
 * 자체가 실패하면 `code = "UNKNOWN_ERROR"` 로 취급한다. 성공 시 봉투의 `data` 만
 * 벗겨 반환하며, `data` 가 없으면 이 역시 에러다.
 */
async function request<T>(
  path: string,
  token: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const baseUrl = resolveBaseUrl();
  const res = await fetch(`${baseUrl}${API_BASE_PATH}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    envelope = null;
  }

  if (!res.ok) {
    throw new BookingApiError(
      envelope?.code ?? "UNKNOWN_ERROR",
      envelope?.message ?? "알 수 없는 오류가 발생했어요.",
      res.status,
    );
  }

  if (envelope?.data == null) {
    throw new BookingApiError("UNKNOWN_ERROR", "알 수 없는 오류가 발생했어요.", res.status);
  }

  return envelope.data;
}

/** 예약 토큰의 지원자 정보와 기존 예약(있다면)을 조회한다. */
export function fetchBookingContext(token: string): Promise<BookingContext> {
  return request<BookingContext>("/context", token);
}

/** 예약 가능한 면접 슬롯 목록을 조회한다. */
export function fetchBookingSlots(token: string): Promise<BookingSlot[]> {
  return request<BookingSlot[]>("/slots", token);
}

/** 선택한 슬롯으로 면접을 예약한다. 성공 시 HTTP 201 이다. */
export function createBookingReservation(
  token: string,
  slotId: number,
): Promise<BookingReservation> {
  return request<BookingReservation>("/reservations", token, {
    method: "POST",
    body: { slotId },
  });
}
