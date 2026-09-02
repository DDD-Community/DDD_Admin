import { useEffect } from "react"
import {
  Button,
  Drawer,
  Input,
  ListBox,
  Select,
  TextArea,
} from "@heroui/react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"

import { cohortQueries } from "@ddd/api"
import type { CohortDto, CohortPartConfigDto } from "@ddd/api"

import { useCreateOrUpdateSlotFlow } from "@/pages/interview-slots/hooks/useCreateOrUpdateSlotFlow"
import { useIsMobile } from "@/shared/hooks/useIsMobile"
import { FormField } from "@/shared/ui/FormField"

import {
  InterviewSlotFormSchema,
  buildInterviewSlotFormDefaults,
  type InterviewSlotForm,
} from "../types"

export type DrawerMode = "create" | "edit"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: DrawerMode
  targetId: number | null
  prefill?: Partial<InterviewSlotForm>
}

const TITLE_BY_MODE: Record<DrawerMode, string> = {
  create: "면접 슬롯 등록",
  edit: "면접 슬롯 수정",
}

const SUBMIT_LABEL_BY_MODE: Record<DrawerMode, string> = {
  create: "등록",
  edit: "저장",
}

const FORM_ID = "interview-slot-form"

export function InterviewSlotRegisterDrawer({
  isOpen,
  onOpenChange,
  mode,
  targetId,
  prefill,
}: Props) {
  const isMobile = useIsMobile()
  const { data: cohorts } = useQuery(cohortQueries.getCohorts())
  const isEdit = mode === "edit"

  const methods = useForm<InterviewSlotForm>({
    resolver: zodResolver(InterviewSlotFormSchema),
    defaultValues: buildInterviewSlotFormDefaults(prefill),
  })
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = methods

  useEffect(
    function resetFormOnOpen() {
      if (isOpen) reset(buildInterviewSlotFormDefaults(prefill))
    },
    [isOpen, mode, prefill, reset]
  )

  const watchedCohortId = watch("cohortId")
  const watchedPartId = watch("cohortPartId")

  const selectedCohort: CohortDto | undefined = cohorts?.find(
    (c) => c.id === watchedCohortId
  )

  const parts = selectedCohort?.parts ?? []
  const selectedPart = parts.find((p) => p.id === watchedPartId)

  const { submit, isPending: isMutating } = useCreateOrUpdateSlotFlow({
    mode,
    targetId,
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submit(values)
      onOpenChange(false)
      reset(buildInterviewSlotFormDefaults())
    } catch {
      // 흐름 훅에서 toast.danger 처리됨
    }
  })

  const onCohortPick = (id: number) => {
    setValue("cohortId", id, { shouldValidate: false })
    setValue("cohortPartId", 0, { shouldValidate: false })
  }

  const onPartPick = (part: CohortPartConfigDto) => {
    setValue("cohortPartId", part.id ?? 0, { shouldValidate: false })
    setValue("cohortPartName", part.partName, { shouldValidate: false })
  }

  const isBusy = isSubmitting || isMutating

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog
          className={!isMobile ? "w-full max-w-120 bg-background" : ""}
        >
          <Drawer.Header>
            <Drawer.Heading className="text-lg font-semibold">
              {TITLE_BY_MODE[mode]}
            </Drawer.Heading>
          </Drawer.Header>

          <Drawer.Body className="flex-1 overflow-y-auto p-5">
            <FormProvider {...methods}>
              <form id={FORM_ID} onSubmit={onSubmit} className="space-y-5">
                <FormField label="기수">
                  <Select
                    aria-label="기수 선택"
                    className="w-full"
                    isDisabled={isEdit}
                  >
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
                            onClick={() => onCohortPick(c.id)}
                          >
                            {c.name}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {isEdit && (
                    <p className="text-foreground-secondary mt-1 text-xs">
                      기수는 변경할 수 없습니다 — 옮기려면 삭제 후 재등록.
                    </p>
                  )}
                </FormField>

                <FormField label="파트">
                  <Select
                    aria-label="파트 선택"
                    className="w-full"
                    isDisabled={isEdit || !selectedCohort}
                  >
                    <Select.Trigger>
                      <Select.Value>
                        {selectedPart
                          ? selectedPart.partName
                          : "파트를 선택하세요"}
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
                            onClick={() => onPartPick(p)}
                          >
                            {p.partName}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {isEdit && (
                    <p className="text-foreground-secondary mt-1 text-xs">
                      파트는 변경할 수 없습니다.
                    </p>
                  )}
                </FormField>

                <FormField label="면접 날짜">
                  <Controller
                    control={control}
                    name="date"
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          type="date"
                          aria-label="면접 날짜"
                          value={field.value?.slice(0, 10) ?? ""}
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

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="시작 시각">
                    <Controller
                      control={control}
                      name="startTime"
                      render={({ field, fieldState }) => (
                        <>
                          <Input
                            type="time"
                            aria-label="시작 시각"
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

                  <FormField label="종료 시각">
                    <Controller
                      control={control}
                      name="endTime"
                      render={({ field, fieldState }) => (
                        <>
                          <Input
                            type="time"
                            aria-label="종료 시각"
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

                <FormField label="수용 인원">
                  <Controller
                    control={control}
                    name="capacity"
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          type="number"
                          min={1}
                          aria-label="수용 인원"
                          value={String(field.value)}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 1)
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
                </FormField>

                <FormField label="장소">
                  <Controller
                    control={control}
                    name="location"
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          aria-label="장소"
                          placeholder="강남구청 회의실 / Google Meet"
                          value={field.value}
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

                <FormField label="설명 (선택)">
                  <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <TextArea
                        aria-label="설명"
                        placeholder="추가 안내 사항"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full"
                      />
                    )}
                  />
                </FormField>
              </form>
            </FormProvider>
          </Drawer.Body>

          <Drawer.Footer className="gap-2">
            <Button slot="close" variant="tertiary">
              취소
            </Button>
            <Button type="submit" form={FORM_ID} isDisabled={isBusy}>
              {isMutating ? "저장 중..." : SUBMIT_LABEL_BY_MODE[mode]}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
