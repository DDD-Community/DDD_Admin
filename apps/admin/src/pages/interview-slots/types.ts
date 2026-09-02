import { z } from "zod"

import { CohortPartConfigDtoName } from "@ddd/api"

/**
 * 면접 슬롯 등록/수정 폼 입력 모델 (RHF + HeroUI v3 DatePicker/TimeField 호환)
 *
 * - date: "YYYY-MM-DD"
 * - startTime / endTime: "HH:mm:ss" (TimeField 의 Time.toString() 결과)
 * - serialize 단계에서 ISO `${date}T${startTime}` 로 합쳐 BE startAt/endAt 으로 전송
 */
export const InterviewSlotFormSchema = z
  .object({
    cohortId: z
      .number({ message: "기수를 선택해주세요" })
      .int()
      .positive("기수를 선택해주세요"),
    cohortPartId: z
      .number({ message: "파트를 선택해주세요" })
      .int()
      .positive("파트를 선택해주세요"),
    cohortPartName: z.nativeEnum(CohortPartConfigDtoName),
    date: z.string().min(1, "면접 날짜를 선택해주세요"),
    startTime: z.string().min(1, "시작 시각을 선택해주세요"),
    endTime: z.string().min(1, "종료 시각을 선택해주세요"),
    capacity: z
      .number({ message: "수용 인원을 입력해주세요" })
      .int()
      .min(1, "최소 1명 이상이어야 합니다"),
    location: z
      .string()
      .min(1, "장소를 입력해주세요")
      .refine((v) => v.trim().length > 0, "장소를 입력해주세요"),
    description: z.string(),
  })
  .refine((v) => v.startTime < v.endTime, {
    message: "종료 시각은 시작 시각보다 뒤여야 합니다",
    path: ["endTime"],
  })

export type InterviewSlotForm = z.infer<typeof InterviewSlotFormSchema>

export const buildInterviewSlotFormDefaults = (
  prefill?: Partial<InterviewSlotForm>,
): InterviewSlotForm => ({
  cohortId: prefill?.cohortId ?? 0,
  cohortPartId: prefill?.cohortPartId ?? 0,
  cohortPartName: prefill?.cohortPartName ?? CohortPartConfigDtoName.PM,
  date: prefill?.date ?? "",
  startTime: prefill?.startTime ?? "",
  endTime: prefill?.endTime ?? "",
  capacity: prefill?.capacity ?? 1,
  location: prefill?.location ?? "",
  description: prefill?.description ?? "",
})
