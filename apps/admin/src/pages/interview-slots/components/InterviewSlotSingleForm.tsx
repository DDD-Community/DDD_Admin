import { Button, Drawer, Input } from "@heroui/react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { FormField } from "@/shared/ui/FormField"

import { useCreateOrUpdateSlotFlow } from "../hooks/useCreateOrUpdateSlotFlow"
import {
  InterviewSlotFormSchema,
  buildInterviewSlotFormDefaults,
  type InterviewSlotForm,
} from "../types"
import { InterviewSlotCohortPartFields } from "./InterviewSlotCohortPartFields"
import { InterviewSlotDateField } from "./InterviewSlotDateField"
import { InterviewSlotDetailFields } from "./InterviewSlotDetailFields"

type Mode = "create" | "edit"

interface Props {
  mode: Mode
  targetId: number | null
  prefill?: Partial<InterviewSlotForm>
  onDone: () => void
}

const SUBMIT_LABEL_BY_MODE: Record<Mode, string> = {
  create: "등록",
  edit: "저장",
}

const FORM_ID = "interview-slot-form"

/** 슬롯 1개 등록/수정 폼. Drawer.Body + Drawer.Footer 를 함께 그린다. */
export function InterviewSlotSingleForm({
  mode,
  targetId,
  prefill,
  onDone,
}: Props) {
  const isEdit = mode === "edit"

  const methods = useForm<InterviewSlotForm>({
    resolver: zodResolver(InterviewSlotFormSchema),
    defaultValues: buildInterviewSlotFormDefaults(prefill),
  })
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods

  const { submit, isPending: isMutating } = useCreateOrUpdateSlotFlow({
    mode,
    targetId,
  })

  const handleFormSubmit = handleSubmit(async (values) => {
    try {
      await submit(values)
      onDone()
    } catch {
      // 흐름 훅에서 toast.danger 처리됨
    }
  })

  const isBusy = isSubmitting || isMutating

  return (
    <>
      <Drawer.Body className="flex-1 overflow-y-auto p-5">
        <FormProvider {...methods}>
          <form id={FORM_ID} onSubmit={handleFormSubmit} className="space-y-5">
            <InterviewSlotCohortPartFields isLocked={isEdit} />
            <InterviewSlotDateField />

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

            <InterviewSlotDetailFields />
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
    </>
  )
}
