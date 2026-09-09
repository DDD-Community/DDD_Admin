import { describe, expect, it } from "vitest"

import { markConflictingCandidates } from "./markConflictingCandidates"

// KST 2026-09-10 14:30 ~ 15:00
const existingSlots = [
  { startAt: "2026-09-10T05:30:00.000Z", endAt: "2026-09-10T06:00:00.000Z" },
]

describe("markConflictingCandidates", () => {
  it("기존 슬롯과 시간이 겹치는 후보에 isConflicting 을 표시한다", () => {
    expect(
      markConflictingCandidates({
        date: "2026-09-10",
        candidates: [
          { startTime: "14:00", endTime: "14:30" },
          { startTime: "14:30", endTime: "15:00" },
          { startTime: "14:45", endTime: "15:15" },
          { startTime: "15:00", endTime: "15:30" },
        ],
        existingSlots,
      })
    ).toEqual([
      { startTime: "14:00", endTime: "14:30", isConflicting: false },
      { startTime: "14:30", endTime: "15:00", isConflicting: true },
      { startTime: "14:45", endTime: "15:15", isConflicting: true },
      { startTime: "15:00", endTime: "15:30", isConflicting: false },
    ])
  })

  it("다른 날짜의 기존 슬롯은 충돌로 보지 않는다", () => {
    expect(
      markConflictingCandidates({
        date: "2026-09-11",
        candidates: [{ startTime: "14:30", endTime: "15:00" }],
        existingSlots,
      })
    ).toEqual([{ startTime: "14:30", endTime: "15:00", isConflicting: false }])
  })
})
