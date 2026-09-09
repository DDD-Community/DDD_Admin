import { useState } from "react"
import {
  Button,
  Drawer,
  Input,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react"
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { FormField } from "@/shared/ui/FormField"

import { MAX_BULK_SLOT_COUNT, SLOT_DURATION_PRESETS } from "../constants"
import { useBulkSlotCandidates } from "../hooks/useBulkSlotCandidates"
import { useCreateSlotsBulkFlow } from "../hooks/useCreateSlotsBulkFlow"
import {
  InterviewSlotBulkFormSchema,
  buildInterviewSlotBulkFormDefaults,
  type InterviewSlotBulkForm as InterviewSlotBulkFormValues,
} from "../types"
import { BulkSlotCandidateList } from "./BulkSlotCandidateList"
import { InterviewSlotCohortPartFields } from "./InterviewSlotCohortPartFields"
import { InterviewSlotDateField } from "./InterviewSlotDateField"
import { InterviewSlotDetailFields } from "./InterviewSlotDetailFields"

interface Props {
  prefill?: Partial<InterviewSlotBulkFormValues>
  onDone: () => void
}

const FORM_ID = "interview-slot-bulk-form"
const CUSTOM_DURATION_KEY = "custom"

type DurationPreset = (typeof SLOT_DURATION_PRESETS)[number]

function isDurationPreset(minutes: number): minutes is DurationPreset {
  return (SLOT_DURATION_PRESETS as readonly number[]).includes(minutes)
}

/** 운영 시간대를 슬롯 길이로 잘라 여러 개를 한 번에 등록하는 폼. Drawer.Body + Footer 를 그린다. */
export function InterviewSlotBulkForm({ prefill, onDone }: Props) {
  const methods = useForm<InterviewSlotBulkFormValues>({
    resolver: zodResolver(InterviewSlotBulkFormSchema),
    defaultValues: buildInterviewSlotBulkFormDefaults(prefill),
  })
  const {
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = methods

  const [
    cohortId,
    cohortPartId,
    date,
    rangeStart,
    rangeEnd,
    durationMinutes,
    excludedStartTimes,
  ] = useWatch({
    control,
    name: [
      "cohortId",
      "cohortPartId",
      "date",
      "rangeStart",
      "rangeEnd",
      "durationMinutes",
      "excludedStartTimes",
    ],
  })
  const [isCustomDuration, setIsCustomDuration] = useState(
    !isDurationPreset(durationMinutes)
  )

  const { candidates, selectedCandidates, conflictingCount, isOverLimit } =
    useBulkSlotCandidates({
      cohortId,
      cohortPartId,
      date,
      rangeStart,
      rangeEnd,
      durationMinutes,
      excludedStartTimes,
    })

  const { createMany, isPending } = useCreateSlotsBulkFlow()

  const handleFormSubmit = handleSubmit(async (values) => {
    // 겹치는 후보는 목록에서 이미 잠겨 있지만, 제출 직전 한 번 더 걸러 등록을 막는다
    const targets = selectedCandidates.filter((c) => !c.isConflicting)
    if (targets.length === 0) return
    const { failedCount } = await createMany(values, targets)
    if (failedCount === 0) onDone()
  })

  function handleDurationPresetChange(keys: Set<React.Key>) {
    const [key] = keys
    if (key === undefined) return
    if (key === CUSTOM_DURATION_KEY) {
      setIsCustomDuration(true)
      return
    }
    setIsCustomDuration(false)
    setValue("durationMinutes", Number(key), { shouldValidate: true })
  }

  function handleCandidateToggle(startTime: string, isSelected: boolean) {
    const next = isSelected
      ? excludedStartTimes.filter((t) => t !== startTime)
      : [...excludedStartTimes, startTime]
    setValue("excludedStartTimes", next)
  }

  const durationPresetKey = isCustomDuration
    ? CUSTOM_DURATION_KEY
    : String(durationMinutes)

  const selectedCount = selectedCandidates.length
  const canSubmit = selectedCount > 0 && !isOverLimit
  const isBusy = isSubmitting || isPending

  return (
    <>
      <Drawer.Body className="flex-1 overflow-y-auto p-5">
        <FormProvider {...methods}>
          <form id={FORM_ID} onSubmit={handleFormSubmit} className="space-y-5">
            <InterviewSlotCohortPartFields isLocked={false} />
            <InterviewSlotDateField />

            <div className="grid grid-cols-2 gap-3">
              <FormField label="운영 시작">
                <Controller
                  control={control}
                  name="rangeStart"
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        type="time"
                        aria-label="운영 시작 시각"
                        value={field.value?.slice(0, 5) ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full"
                      />
                      {fieldState.error && (
                        <p className="mt-1 text-xs text-danger">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </FormField>

              <FormField label="운영 종료">
                <Controller
                  control={control}
                  name="rangeEnd"
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        type="time"
                        aria-label="운영 종료 시각"
                        value={field.value?.slice(0, 5) ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full"
                      />
                      {fieldState.error && (
                        <p className="mt-1 text-xs text-danger">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </FormField>
            </div>

            <FormField label="슬롯 길이">
              <div className="space-y-2">
                <ToggleButtonGroup
                  aria-label="슬롯 길이 선택"
                  selectionMode="single"
                  disallowEmptySelection
                  fullWidth
                  selectedKeys={[durationPresetKey]}
                  onSelectionChange={handleDurationPresetChange}
                >
                  {SLOT_DURATION_PRESETS.map((minutes) => (
                    <ToggleButton key={minutes} id={String(minutes)}>
                      {minutes}분
                    </ToggleButton>
                  ))}
                  <ToggleButton id={CUSTOM_DURATION_KEY}>
                    직접 입력
                  </ToggleButton>
                </ToggleButtonGroup>
                {isCustomDuration && (
                  <Controller
                    control={control}
                    name="durationMinutes"
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          type="number"
                          min={5}
                          step={5}
                          aria-label="슬롯 길이(분)"
                          placeholder="분 단위"
                          value={String(field.value)}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="w-full"
                        />
                        {fieldState.error && (
                          <p className="mt-1 text-xs text-danger">
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                )}
              </div>
            </FormField>

            <FormField label="생성될 슬롯">
              <div className="space-y-2">
                <BulkSlotCandidateList
                  candidates={candidates}
                  excludedStartTimes={excludedStartTimes}
                  selectedCount={selectedCount}
                  onToggle={handleCandidateToggle}
                />
                {conflictingCount > 0 && (
                  <p className="text-xs text-warning">
                    기존 슬롯과 겹치는 {conflictingCount}개는 등록할 수 없어
                    제외됩니다.
                  </p>
                )}
                {isOverLimit && (
                  <p className="text-xs text-danger">
                    한 번에 최대 {MAX_BULK_SLOT_COUNT}개까지 등록할 수 있습니다.
                    운영 시간대를 나눠 등록해주세요.
                  </p>
                )}
              </div>
            </FormField>

            <InterviewSlotDetailFields />
          </form>
        </FormProvider>
      </Drawer.Body>

      <Drawer.Footer className="gap-2">
        <Button slot="close" variant="tertiary">
          취소
        </Button>
        <Button type="submit" form={FORM_ID} isDisabled={isBusy || !canSubmit}>
          {isPending ? "등록 중..." : `${selectedCount}개 등록`}
        </Button>
      </Drawer.Footer>
    </>
  )
}
