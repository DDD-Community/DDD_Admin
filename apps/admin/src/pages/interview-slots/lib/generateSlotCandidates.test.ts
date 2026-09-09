import { describe, expect, it } from "vitest"

import { generateSlotCandidates } from "./generateSlotCandidates"

describe("generateSlotCandidates", () => {
  it("운영 시간대를 슬롯 길이로 잘라 연속 후보를 만든다", () => {
    expect(
      generateSlotCandidates({
        rangeStart: "14:00",
        rangeEnd: "15:30",
        durationMinutes: 30,
      })
    ).toEqual([
      { startTime: "14:00", endTime: "14:30" },
      { startTime: "14:30", endTime: "15:00" },
      { startTime: "15:00", endTime: "15:30" },
    ])
  })

  it("범위 끝에 슬롯 길이가 다 들어가지 않는 자투리는 제외한다", () => {
    expect(
      generateSlotCandidates({
        rangeStart: "14:00",
        rangeEnd: "15:50",
        durationMinutes: 60,
      })
    ).toEqual([{ startTime: "14:00", endTime: "15:00" }])
  })

  it("슬롯 길이가 0 이하이면 빈 배열을 돌려준다", () => {
    expect(
      generateSlotCandidates({
        rangeStart: "14:00",
        rangeEnd: "15:00",
        durationMinutes: 0,
      })
    ).toEqual([])
    expect(
      generateSlotCandidates({
        rangeStart: "14:00",
        rangeEnd: "15:00",
        durationMinutes: -30,
      })
    ).toEqual([])
  })

  it("종료가 시작보다 앞이거나 같으면 빈 배열을 돌려준다", () => {
    expect(
      generateSlotCandidates({
        rangeStart: "15:00",
        rangeEnd: "14:00",
        durationMinutes: 30,
      })
    ).toEqual([])
  })

  it("정수가 아닌 슬롯 길이는 빈 배열을 돌려준다", () => {
    expect(
      generateSlotCandidates({
        rangeStart: "14:00",
        rangeEnd: "15:00",
        durationMinutes: 12.5,
      })
    ).toEqual([])
  })
})
