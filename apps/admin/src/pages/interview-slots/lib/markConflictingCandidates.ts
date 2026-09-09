import type { InterviewSlot } from "@ddd/api"

import { combineToIsoLocal } from "./serialize"
import type { SlotCandidate } from "./generateSlotCandidates"

export interface MarkedSlotCandidate extends SlotCandidate {
  /** 같은 기수·파트에 이미 등록된 슬롯과 시간이 겹침 */
  isConflicting: boolean
}

interface MarkArgs {
  /** "YYYY-MM-DD" */
  date: string
  candidates: SlotCandidate[]
  existingSlots: Pick<InterviewSlot, "startAt" | "endAt">[]
}

/**
 * 후보 슬롯이 기존 슬롯과 겹치는지 표시한다. BE 에 겹침 검사가 없어 FE 에서 막는다.
 * 경계가 맞닿는 경우(14:30 종료 → 14:30 시작)는 겹침이 아니다.
 */
export function markConflictingCandidates({
  date,
  candidates,
  existingSlots,
}: MarkArgs): MarkedSlotCandidate[] {
  const existingRanges = existingSlots.map((slot) => ({
    start: new Date(slot.startAt).getTime(),
    end: new Date(slot.endAt).getTime(),
  }))

  return candidates.map((candidate) => {
    const start = new Date(
      combineToIsoLocal(date, candidate.startTime)
    ).getTime()
    const end = new Date(combineToIsoLocal(date, candidate.endTime)).getTime()
    const isConflicting = existingRanges.some(
      (range) => range.start < end && start < range.end
    )
    return { ...candidate, isConflicting }
  })
}
