import { ListBox, Select } from "@heroui/react"
import { useFormContext, useWatch } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { cohortQueries } from "@ddd/api"
import type { CohortDto, CohortPartConfigDto } from "@ddd/api"

import { FormField } from "@/shared/ui/FormField"

import type { InterviewSlotSharedForm } from "../types"

interface Props {
  /** 수정 모드 — 슬롯의 기수/파트는 한 번 만들면 변경 불가 (정책) */
  isLocked: boolean
}

export function InterviewSlotCohortPartFields({ isLocked }: Props) {
  const { data: cohorts } = useQuery(cohortQueries.getCohorts())
  const { control, setValue } = useFormContext<InterviewSlotSharedForm>()

  const watchedCohortId = useWatch({ control, name: "cohortId" })
  const watchedPartId = useWatch({ control, name: "cohortPartId" })

  const selectedCohort: CohortDto | undefined = cohorts?.find(
    (c) => c.id === watchedCohortId
  )
  const parts = selectedCohort?.parts ?? []
  const selectedPart = parts.find((p) => p.id === watchedPartId)

  function handleCohortPick(id: number) {
    setValue("cohortId", id, { shouldValidate: false })
    setValue("cohortPartId", 0, { shouldValidate: false })
  }

  function handlePartPick(part: CohortPartConfigDto) {
    setValue("cohortPartId", part.id ?? 0, { shouldValidate: false })
    setValue("cohortPartName", part.partName, { shouldValidate: false })
  }

  return (
    <>
      <FormField label="기수">
        <Select aria-label="기수 선택" className="w-full" isDisabled={isLocked}>
          <Select.Trigger>
            <Select.Value>
              {selectedCohort?.name ?? "기수를 선택하세요"}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {(cohorts ?? []).map((c) => (
                <ListBox.Item
                  key={c.id}
                  id={String(c.id)}
                  textValue={c.name}
                  onClick={() => handleCohortPick(c.id)}
                >
                  {c.name}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        {isLocked && (
          <p className="text-foreground-secondary mt-1 text-xs">
            기수는 변경할 수 없습니다 — 옮기려면 삭제 후 재등록.
          </p>
        )}
      </FormField>

      <FormField label="파트">
        <Select
          aria-label="파트 선택"
          className="w-full"
          isDisabled={isLocked || !selectedCohort}
        >
          <Select.Trigger>
            <Select.Value>
              {selectedPart ? selectedPart.partName : "파트를 선택하세요"}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {parts.map((p) => (
                <ListBox.Item
                  key={p.id}
                  id={String(p.id)}
                  textValue={p.partName}
                  onClick={() => handlePartPick(p)}
                >
                  {p.partName}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        {isLocked && (
          <p className="text-foreground-secondary mt-1 text-xs">
            파트는 변경할 수 없습니다.
          </p>
        )}
      </FormField>
    </>
  )
}
