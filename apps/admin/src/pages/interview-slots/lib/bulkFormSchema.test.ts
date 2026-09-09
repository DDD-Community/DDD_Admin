import { describe, expect, it } from "vitest"

import { CohortPartConfigDtoName } from "@ddd/api"

import { InterviewSlotBulkFormSchema } from "../types"

const validForm = {
  cohortId: 1,
  cohortPartId: 2,
  cohortPartName: CohortPartConfigDtoName.PM,
  date: "2026-09-10",
  rangeStart: "14:00",
  rangeEnd: "18:00",
  durationMinutes: 30,
  excludedStartTimes: [],
  capacity: 1,
  location: "Google Meet",
  description: "",
}

function firstIssuePath(input: unknown): string | undefined {
  const result = InterviewSlotBulkFormSchema.safeParse(input)
  return result.success ? undefined : String(result.error.issues[0]?.path[0])
}

describe("InterviewSlotBulkFormSchema", () => {
  it("정상 입력을 통과시킨다", () => {
    expect(InterviewSlotBulkFormSchema.safeParse(validForm).success).toBe(true)
  })

  it("운영 종료 시각이 시작보다 앞이면 rangeEnd 에러", () => {
    expect(
      firstIssuePath({ ...validForm, rangeStart: "18:00", rangeEnd: "14:00" })
    ).toBe("rangeEnd")
  })

  it("슬롯 길이는 5분 이상 480분 이하 정수여야 한다", () => {
    expect(firstIssuePath({ ...validForm, durationMinutes: 0 })).toBe(
      "durationMinutes"
    )
    expect(firstIssuePath({ ...validForm, durationMinutes: 481 })).toBe(
      "durationMinutes"
    )
    expect(firstIssuePath({ ...validForm, durationMinutes: 12.5 })).toBe(
      "durationMinutes"
    )
  })
})
