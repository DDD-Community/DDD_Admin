import type { FallbackProps } from "react-error-boundary"

import { BookingApiError } from "../lib/bookingApi"
import type { BookingNoticeStatus } from "../types"

import { BookingNotice } from "./BookingNotice"

const NOTICE_STATUS_BY_HTTP: Partial<Record<number, BookingNoticeStatus>> = {
  401: "expired",
  403: "ineligible",
}

function toNoticeStatus(error: unknown): BookingNoticeStatus {
  if (error instanceof BookingApiError) {
    return NOTICE_STATUS_BY_HTTP[error.status] ?? "failed"
  }
  return "failed"
}

/** context/slots 조회 실패를 안내 화면으로 바꾼다. 네트워크·5xx 만 재시도를 허용한다. */
export function BookingErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <BookingNotice
      status={toNoticeStatus(error)}
      onRetry={resetErrorBoundary}
    />
  )
}
