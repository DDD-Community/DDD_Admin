import { z } from "zod"

import { CohortPartConfigDtoName } from "@ddd/api"

import {
  MAX_SLOT_DURATION_MINUTES,
  MIN_SLOT_DURATION_MINUTES,
} from "./constants"

/**
 * 단건·반복 등록 폼이 공유하는 필드. 기수/파트/날짜/정원/장소/설명.
 * 두 폼 컴포넌트가 같은 이름으로 `useFormContext` 하므로 이 스키마가 그 계약이다.
 */
const InterviewSlotSharedFieldsSchema = z.object({
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
  capacity: z
    .number({ message: "수용 인원을 입력해주세요" })
    .int()
    .min(1, "최소 1명 이상이어야 합니다"),
  location: z
    .string()
    .refine((v) => v.trim().length > 0, "장소를 입력해주세요"),
  description: z.string(),
})

export type InterviewSlotSharedForm = z.infer<
  typeof InterviewSlotSharedFieldsSchema
>

/**
 * 면접 슬롯 단건 등록/수정 폼 입력 모델 (RHF + HeroUI v3 DatePicker/TimeField 호환)
 *
 * - date: "YYYY-MM-DD"
 * - startTime / endTime: "HH:mm:ss" (TimeField 의 Time.toString() 결과)
 * - serialize 단계에서 ISO `${date}T${startTime}` 로 합쳐 BE startAt/endAt 으로 전송
 */
export const InterviewSlotFormSchema = InterviewSlotSharedFieldsSchema.extend({
  startTime: z.string().min(1, "시작 시각을 선택해주세요"),
  endTime: z.string().min(1, "종료 시각을 선택해주세요"),
}).refine((v) => v.startTime < v.endTime, {
  message: "종료 시각은 시작 시각보다 뒤여야 합니다",
  path: ["endTime"],
})

export type InterviewSlotForm = z.infer<typeof InterviewSlotFormSchema>

export const buildInterviewSlotFormDefaults = (
  prefill?: Partial<InterviewSlotForm>
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

/**
 * 면접 슬롯 반복 등록 폼 입력 모델.
 *
 * - rangeStart / rangeEnd: "HH:mm" 운영 시간대
 * - durationMinutes: 슬롯 하나의 길이(분)
 * - excludedStartTimes: 미리보기에서 사용자가 체크 해제한 후보의 startTime
 */
export const InterviewSlotBulkFormSchema =
  InterviewSlotSharedFieldsSchema.extend({
    rangeStart: z.string().min(1, "운영 시작 시각을 선택해주세요"),
    rangeEnd: z.string().min(1, "운영 종료 시각을 선택해주세요"),
    durationMinutes: z
      .number({ message: "슬롯 길이를 입력해주세요" })
      .int("슬롯 길이는 분 단위 정수여야 합니다")
      .min(
        MIN_SLOT_DURATION_MINUTES,
        `슬롯 길이는 ${MIN_SLOT_DURATION_MINUTES}분 이상이어야 합니다`
      )
      .max(
        MAX_SLOT_DURATION_MINUTES,
        `슬롯 길이는 ${MAX_SLOT_DURATION_MINUTES}분 이하여야 합니다`
      ),
    excludedStartTimes: z.array(z.string()),
  }).refine((v) => v.rangeStart < v.rangeEnd, {
    message: "운영 종료 시각은 시작 시각보다 뒤여야 합니다",
    path: ["rangeEnd"],
  })

export type InterviewSlotBulkForm = z.infer<typeof InterviewSlotBulkFormSchema>

export const buildInterviewSlotBulkFormDefaults = (
  prefill?: Partial<InterviewSlotBulkForm>
): InterviewSlotBulkForm => ({
  cohortId: prefill?.cohortId ?? 0,
  cohortPartId: prefill?.cohortPartId ?? 0,
  cohortPartName: prefill?.cohortPartName ?? CohortPartConfigDtoName.PM,
  date: prefill?.date ?? "",
  rangeStart: prefill?.rangeStart ?? "",
  rangeEnd: prefill?.rangeEnd ?? "",
  durationMinutes: prefill?.durationMinutes ?? 30,
  excludedStartTimes: prefill?.excludedStartTimes ?? [],
  capacity: prefill?.capacity ?? 1,
  location: prefill?.location ?? "",
  description: prefill?.description ?? "",
})
