import { describe, expect, it } from "vitest"

import { CohortPartConfigDtoName } from "@ddd/api"

import { serializeBulkFormToCreatePayloads } from "./serialize"

describe("serializeBulkFormToCreatePayloads", () => {
  it("후보마다 공통 필드를 붙인 생성 페이로드를 만든다", () => {
    const payloads = serializeBulkFormToCreatePayloads(
      {
        cohortId: 1,
        cohortPartId: 2,
        cohortPartName: CohortPartConfigDtoName.PM,
        date: "2026-09-10",
        rangeStart: "14:00",
        rangeEnd: "15:00",
        durationMinutes: 30,
        excludedStartTimes: [],
        capacity: 2,
        location: "  Google Meet ",
        description: "   ",
      },
      [
        { startTime: "14:00", endTime: "14:30" },
        { startTime: "14:30", endTime: "15:00" },
      ]
    )

    expect(payloads).toEqual([
      {
        cohortId: 1,
        cohortPartId: 2,
        startAt: "2026-09-10T05:00:00.000Z",
        endAt: "2026-09-10T05:30:00.000Z",
        capacity: 2,
        location: "Google Meet",
        description: undefined,
      },
      {
        cohortId: 1,
        cohortPartId: 2,
        startAt: "2026-09-10T05:30:00.000Z",
        endAt: "2026-09-10T06:00:00.000Z",
        capacity: 2,
        location: "Google Meet",
        description: undefined,
      },
    ])
  })
})
