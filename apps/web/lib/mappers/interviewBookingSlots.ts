import type { BookingSlot } from "@/lib/api/interview-booking";

/**
 * 면접 슬롯을 KST 날짜별로 묶고 화면 표기 문자열을 만드는 순수 헬퍼.
 *
 * BE 는 UTC ISO 로 내려준다. 브라우저 로컬 타임존으로 포맷하면 해외 체류
 * 지원자에게 다른 시각이 보이므로, 면접 시간은 항상 `Asia/Seoul` 로 명시
 * 고정한다(설계 §6). 날짜 그룹 키도 같은 타임존에서 뽑아야 자정 근처 슬롯이
 * 다른 날짜 그룹으로 새지 않는다 — `toISOString().slice(0, 10)` 은 UTC 라 틀린다.
 */

export type BookingSlotGroup = {
  dateKey: string;
  dateLabel: string;
  slots: BookingSlot[];
};

const KST_TIME_ZONE = "Asia/Seoul";

const dateKeyFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KST_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateLabelFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KST_TIME_ZONE,
  month: "long",
  day: "numeric",
  weekday: "short",
});

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KST_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KST_TIME_ZONE,
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  // 명시하지 않으면 ko-KR 인데도 dayPeriod 가 "오후" 대신 "PM" 으로 나온다
  // (hour12 만으로 자동 삽입되는 dayPeriod 는 스타일이 다르게 결정됨) — node 로 확인.
  dayPeriod: "short",
});

/** KST 기준 `YYYY-MM-DD` 그룹 키를 만든다. `formatToParts` 로 연/월/일을 뽑아 조립한다. */
function toKstDateKey(iso: string): string {
  const parts = dateKeyFormatter.formatToParts(new Date(iso));
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  return `${year}-${month}-${day}`;
}

/** `9월 10일 (수)` 형태의 날짜 라벨을 만든다. */
function toKstDateLabel(iso: string): string {
  const parts = dateLabelFormatter.formatToParts(new Date(iso));
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  return `${month} ${day}일 (${weekday})`;
}

/** 슬롯을 KST 날짜 기준으로 묶는다. 그룹은 날짜 오름차순, 그룹 내 슬롯은 `startAt` 오름차순이다. */
export function groupSlotsByKstDate(slots: BookingSlot[]): BookingSlotGroup[] {
  const sorted = [...slots].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );

  const groupsByKey = new Map<string, BookingSlotGroup>();
  for (const slot of sorted) {
    const dateKey = toKstDateKey(slot.startAt);
    const existing = groupsByKey.get(dateKey);
    if (existing) {
      existing.slots.push(slot);
      continue;
    }
    groupsByKey.set(dateKey, {
      dateKey,
      dateLabel: toKstDateLabel(slot.startAt),
      slots: [slot],
    });
  }

  return [...groupsByKey.values()].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

/** KST 기준 `14:00 ~ 14:40` 형태의 시간 범위를 만든다. `endAt` 이 없으면 시작 시각만 반환한다. */
export function formatKstTimeRange(startAt: string, endAt?: string): string {
  const start = timeFormatter.format(new Date(startAt));
  if (!endAt) return start;
  const end = timeFormatter.format(new Date(endAt));
  return `${start} ~ ${end}`;
}

/** KST 기준 `9월 10일 (수) 오후 2:00` 형태의 날짜·시간 문자열을 만든다. */
export function formatKstDateTime(startAt: string): string {
  const parts = dateTimeFormatter.formatToParts(new Date(startAt));
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value ?? "";
  const hour = parts.find((part) => part.type === "hour")?.value ?? "";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "";
  return `${month} ${day}일 (${weekday}) ${dayPeriod} ${hour}:${minute}`;
}
