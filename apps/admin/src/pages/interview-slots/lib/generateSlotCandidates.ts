export interface SlotCandidate {
  /** "HH:mm" */
  startTime: string
  /** "HH:mm" */
  endTime: string
}

interface GenerateArgs {
  rangeStart: string
  rangeEnd: string
  durationMinutes: number
}

const pad = (n: number): string => `${n}`.padStart(2, "0")

function toMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number)
  return hour * 60 + minute
}

function toTime(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

/**
 * 운영 시간대(rangeStart ~ rangeEnd)를 durationMinutes 단위로 잘라 연속 슬롯 후보를 만든다.
 * Date 객체 대신 "분" 정수로만 계산해 타임존·DST 영향을 받지 않는다.
 */
export function generateSlotCandidates({
  rangeStart,
  rangeEnd,
  durationMinutes,
}: GenerateArgs): SlotCandidate[] {
  const candidates: SlotCandidate[] = []
  const end = toMinutes(rangeEnd)
  // 0 이하·소수 길이는 루프가 끝나지 않거나 "HH:mm" 이 깨지므로 후보 없음으로 처리
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0)
    return candidates
  for (
    let start = toMinutes(rangeStart);
    start + durationMinutes <= end;
    start += durationMinutes
  ) {
    candidates.push({
      startTime: toTime(start),
      endTime: toTime(start + durationMinutes),
    })
  }
  return candidates
}
