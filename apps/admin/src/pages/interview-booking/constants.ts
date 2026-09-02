import type { BookingNoticeStatus } from "./types"

export const PAGE_TITLE = "면접 시간 예약 | DDD"

export const NOTICE_TEXT: Record<BookingNoticeStatus, string> = {
  invalid: "잘못된 접근입니다. 메일의 예약 링크로 다시 들어와 주세요",
  expired: "링크가 만료되었습니다. 운영진에게 문의해주세요",
  ineligible: "지금은 예약할 수 있는 상태가 아니에요. 운영진에게 문의해주세요",
  failed: "정보를 불러오지 못했어요",
}

export const SLOT_FULL_BANNER = "방금 마감되었어요. 다른 시간을 골라주세요"

export const CONFIRM_RETRY_MESSAGE =
  "예약 확정 중 문제가 발생했어요. 다시 시도해주세요."

export const RESERVATION_CHECK_FAILED_MESSAGE =
  "예약 확인 중 문제가 발생했어요. 다시 시도해주세요."

export const NO_INFO_PLACEHOLDER = "안내 예정"
