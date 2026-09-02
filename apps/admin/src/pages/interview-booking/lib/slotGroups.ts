import type { BookingSlot } from "../types"

/**
 * 면접 슬롯을 KST 날짜별로 묶고 화면 표기 문자열을 만드는 순수 헬퍼.
 *
 * BE 는 UTC ISO 로 내려준다. 브라우저 로컬 타임존으로 포맷하면 해외 체류 지원자에게
 * 다른 시각이 보이므로 면접 시간은 항상 `Asia/Seoul` 로 고정한다. 날짜 그룹 키도
 * 같은 타임존에서 뽑아야 자정 근처 슬롯이 다른 날짜로 새지 않는다 —
 * `toISOString().slice(0, 10)` 은 UTC 라 틀린다.
 */
export interface BookingSlotGroup {
  dateKey: string
  dateLabel: string
  slots: BookingSlot[]
}

const KST_TIME_ZONE = "Asia/Seoul"

const dateKeyFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KST_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const dateLabelFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KST_TIME_ZONE,
  month: "long",
  day: "numeric",
  weekday: "short",
})

// hourCycle 을 명시해 로케일 기본값(구현에 따라 h23/h24 로 갈린다)에 기대지 않는다.
const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KST_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

function findPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
): string {
  return parts.find((part) => part.type === type)?.value ?? ""
}

function toKstDateKey(iso: string): string {
  const parts = dateKeyFormatter.formatToParts(new Date(iso))
  return `${findPart(parts, "year")}-${findPart(parts, "month")}-${findPart(parts, "day")}`
}

/** `9월 10일 (수)` */
function toKstDateLabel(iso: string): string {
  const parts = dateLabelFormatter.formatToParts(new Date(iso))
  return `${findPart(parts, "month")} ${findPart(parts, "day")}일 (${findPart(parts, "weekday")})`
}

/** 그룹은 날짜 오름차순, 그룹 내 슬롯은 `startAt` 오름차순. */
export function groupSlotsByKstDate(slots: BookingSlot[]): BookingSlotGroup[] {
  const sorted = [...slots].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  )

  const groupsByKey = new Map<string, BookingSlotGroup>()
  for (const slot of sorted) {
    const dateKey = toKstDateKey(slot.startAt)
    const existing = groupsByKey.get(dateKey)
    if (existing) {
      existing.slots.push(slot)
      continue
    }
    groupsByKey.set(dateKey, {
      dateKey,
      dateLabel: toKstDateLabel(slot.startAt),
      slots: [slot],
    })
  }

  return [...groupsByKey.values()].sort((a, b) =>
    a.dateKey.localeCompare(b.dateKey)
  )
}

/** `14:00 ~ 14:40`. `endAt` 이 없으면 시작 시각만. */
export function formatKstTimeRange(startAt: string, endAt?: string): string {
  const start = timeFormatter.format(new Date(startAt))
  if (!endAt) return start
  return `${start} ~ ${timeFormatter.format(new Date(endAt))}`
}

/**
 * `9월 10일 (수) 오후 2:00`.
 *
 * ko-KR 의 `dayPeriod` 옵션은 ICU 버전에 따라 "정오"/"저녁"/"밤" 같은 표현을 내므로,
 * 24시 hour 를 직접 뽑아 오전/오후를 조립한다. 정오는 "오후 12:00", 자정은 "오전 12:00".
 */
export function formatKstDateTime(startAt: string): string {
  const date = new Date(startAt)
  const dateParts = dateLabelFormatter.formatToParts(date)
  const timeParts = timeFormatter.formatToParts(date)

  const hour24 = Number(findPart(timeParts, "hour"))
  const minute = findPart(timeParts, "minute")
  const dayPeriod = hour24 < 12 ? "오전" : "오후"
  const hour12 = hour24 % 12 || 12

  return `${findPart(dateParts, "month")} ${findPart(dateParts, "day")}일 (${findPart(dateParts, "weekday")}) ${dayPeriod} ${hour12}:${minute}`
}
