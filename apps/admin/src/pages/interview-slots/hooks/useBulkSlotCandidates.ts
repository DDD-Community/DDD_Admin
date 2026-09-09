import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { interviewQueries } from "@ddd/api"

import { MAX_BULK_SLOT_COUNT } from "../constants"
import { generateSlotCandidates } from "../lib/generateSlotCandidates"
import {
  markConflictingCandidates,
  type MarkedSlotCandidate,
} from "../lib/markConflictingCandidates"
import type { InterviewSlotBulkForm } from "../types"

type Args = Pick<
  InterviewSlotBulkForm,
  | "cohortId"
  | "cohortPartId"
  | "date"
  | "rangeStart"
  | "rangeEnd"
  | "durationMinutes"
  | "excludedStartTimes"
>

/**
 * 반복 등록 미리보기 — 입력값으로 후보를 만들고, 같은 기수·파트의 기존 슬롯과 겹치는
 * 후보를 표시한다. 겹치는 후보는 선택 대상에서 제외돼 등록 자체가 막힌다.
 */
export function useBulkSlotCandidates({
  cohortId,
  cohortPartId,
  date,
  rangeStart,
  rangeEnd,
  durationMinutes,
  excludedStartTimes,
}: Args) {
  const { data: existingSlots = [] } = useQuery({
    ...interviewQueries.getInterviewSlots({
      params: { cohortId, cohortPartId },
    }),
    enabled: cohortId > 0 && cohortPartId > 0,
  })

  const candidates: MarkedSlotCandidate[] = useMemo(
    () =>
      markConflictingCandidates({
        date,
        candidates: generateSlotCandidates({
          rangeStart,
          rangeEnd,
          durationMinutes,
        }),
        existingSlots,
      }),
    [date, rangeStart, rangeEnd, durationMinutes, existingSlots]
  )

  const selectedCandidates = candidates.filter(
    (candidate) =>
      !candidate.isConflicting &&
      !excludedStartTimes.includes(candidate.startTime)
  )
  const conflictingCount = candidates.filter((c) => c.isConflicting).length
  const isOverLimit = selectedCandidates.length > MAX_BULK_SLOT_COUNT

  return { candidates, selectedCandidates, conflictingCount, isOverLimit }
}
