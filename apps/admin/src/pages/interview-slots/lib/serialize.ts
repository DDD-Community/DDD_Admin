import type {
  CreateInterviewSlotRequestDto,
  InterviewSlot,
  UpdateInterviewSlotRequestDto,
} from "@ddd/api"

import type { InterviewSlotBulkForm, InterviewSlotForm } from "../types"
import type { SlotCandidate } from "./generateSlotCandidates"

const pad = (n: number): string => `${n}`.padStart(2, "0")

/**
 * "2026-03-15" + "14:00" (브라우저 로컬 시각, KST) → UTC ISO 문자열.
 * `new Date("...T...")` 는 offset 없는 date-time 문자열을 로컬 시각으로 해석하므로,
 * `toISOString()` 으로 BE 계약(예: "2026-05-01T14:00:00+09:00")이 요구하는
 * timezone-aware 값으로 변환한다.
 */
export const combineToIsoLocal = (date: string, time: string): string => {
  const t = time.length === 5 ? `${time}:00` : time
  return new Date(`${date}T${t}`).toISOString()
}

/** UTC ISO 문자열 → 로컬(KST) 기준 "YYYY-MM-DD" */
const isoDate = (iso: string): string => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** UTC ISO 문자열 → 로컬(KST) 기준 "HH:mm:ss" */
const isoTime = (iso: string): string => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const trimmedOrUndefined = (s: string): string | undefined => {
  const t = s.trim()
  return t.length === 0 ? undefined : t
}

export const serializeFormToCreatePayload = (
  form: InterviewSlotForm
): CreateInterviewSlotRequestDto => ({
  cohortId: form.cohortId,
  cohortPartId: form.cohortPartId,
  startAt: combineToIsoLocal(form.date, form.startTime),
  endAt: combineToIsoLocal(form.date, form.endTime),
  capacity: form.capacity,
  location: trimmedOrUndefined(form.location),
  description: trimmedOrUndefined(form.description),
})

/** 반복 등록 — 선택된 후보마다 공통 필드(기수/파트/정원/장소/설명)를 붙인 생성 페이로드 */
export const serializeBulkFormToCreatePayloads = (
  form: InterviewSlotBulkForm,
  candidates: SlotCandidate[]
): CreateInterviewSlotRequestDto[] =>
  candidates.map((candidate) => ({
    cohortId: form.cohortId,
    cohortPartId: form.cohortPartId,
    startAt: combineToIsoLocal(form.date, candidate.startTime),
    endAt: combineToIsoLocal(form.date, candidate.endTime),
    capacity: form.capacity,
    location: trimmedOrUndefined(form.location),
    description: trimmedOrUndefined(form.description),
  }))

/**
 * 수정 페이로드 — BE PATCH DTO 가 cohortId/cohortPartId 를 받지 않으므로 제외.
 * 슬롯의 기수/파트는 한 번 만들면 변경 불가 (정책).
 */
export const serializeFormToUpdatePayload = (
  form: InterviewSlotForm
): UpdateInterviewSlotRequestDto => ({
  startAt: combineToIsoLocal(form.date, form.startTime),
  endAt: combineToIsoLocal(form.date, form.endTime),
  capacity: form.capacity,
  location: trimmedOrUndefined(form.location),
  description: trimmedOrUndefined(form.description),
})

export const serializeSlotToForm = (
  slot: InterviewSlot
): Partial<InterviewSlotForm> => ({
  cohortId: slot.cohortId,
  cohortPartId: slot.cohortPartId,
  date: isoDate(slot.startAt),
  startTime: isoTime(slot.startAt),
  endTime: isoTime(slot.endAt),
  capacity: slot.capacity,
  location: slot.location ?? "",
  description: slot.description ?? "",
})
