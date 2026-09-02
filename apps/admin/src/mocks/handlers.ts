import type { RequestHandler } from "msw"

import { interviewBookingHandlers } from "./interviewBooking.handlers"

/**
 * MSW 핸들러 목록
 *
 * 새 핸들러를 추가할 때:
 *   1. {도메인}.handlers.ts 에 핸들러 배열 작성
 *   2. 아래 handlers 배열에 ...{도메인}Handlers 추가
 *
 * 어드민 페이지는 모두 `@ddd/api` 실 API 를 쓴다. 지원자 예약 페이지(`/interview`)만
 * 실제 예약 토큰 없이 화면을 확인할 수 있도록 목을 둔다.
 * `VITE_MSW_ENABLED=true` 환경에서만 활성화된다 (`main.tsx`).
 */
export const handlers: RequestHandler[] = [...interviewBookingHandlers]
