import { useState } from "react"
import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { interviewKeys, interviewMutations } from "@ddd/api"

import type { SlotCandidate } from "../lib/generateSlotCandidates"
import { serializeBulkFormToCreatePayloads } from "../lib/serialize"
import type { InterviewSlotBulkForm } from "../types"

interface BulkResult {
  total: number
  succeededCount: number
  failedCount: number
}

type Outcome = "all" | "partial" | "none"

function toOutcome({ succeededCount, failedCount }: BulkResult): Outcome {
  if (failedCount === 0) return "all"
  if (succeededCount === 0) return "none"
  return "partial"
}

const NOTIFY_BY_OUTCOME: Record<
  Outcome,
  (result: BulkResult, firstError: Error | undefined) => void
> = {
  all: ({ succeededCount }) =>
    toast.success(`면접 슬롯 ${succeededCount}개를 등록했습니다`),
  none: (_, firstError) =>
    toast.danger("슬롯 등록에 실패했습니다", {
      description: firstError?.message,
    }),
  partial: ({ total, failedCount }) =>
    toast.danger(`${total}개 중 ${failedCount}개 등록에 실패했습니다`, {
      description:
        "등록된 슬롯은 목록에서 '이미 등록됨'으로 바뀝니다. 다시 등록하면 실패한 슬롯만 전송됩니다.",
    }),
}

/**
 * interview-slot 반복 등록 흐름.
 * BE 에 일괄 생성 API 가 없어 단건 POST 를 후보 수만큼 병렬 호출한다.
 * 원자성이 없으므로 부분 실패를 구분해 알리고, 성공분은 목록 invalidate 로 반영한다.
 */
export function useCreateSlotsBulkFlow() {
  const queryClient = useQueryClient()
  const createMutation = useMutation(interviewMutations.createInterviewSlot())
  // 병렬 mutateAsync 는 useMutation 의 isPending 이 마지막 호출만 추적하므로 직접 관리한다
  const [isPending, setIsPending] = useState(false)

  async function createMany(
    form: InterviewSlotBulkForm,
    candidates: SlotCandidate[]
  ): Promise<BulkResult> {
    const payloads = serializeBulkFormToCreatePayloads(form, candidates)
    setIsPending(true)
    try {
      const settled = await Promise.allSettled(
        payloads.map((payload) => createMutation.mutateAsync({ payload }))
      )
      const rejected = settled.filter(
        (r): r is PromiseRejectedResult => r.status === "rejected"
      )
      const result: BulkResult = {
        total: settled.length,
        succeededCount: settled.length - rejected.length,
        failedCount: rejected.length,
      }
      NOTIFY_BY_OUTCOME[toOutcome(result)](result, rejected[0]?.reason as Error)
      return result
    } finally {
      setIsPending(false)
      queryClient.invalidateQueries({ queryKey: interviewKeys.slotLists() })
    }
  }

  return { createMany, isPending }
}
