import { Input } from "@heroui/react"
import { Controller, useFormContext } from "react-hook-form"

import { FormField } from "@/shared/ui/FormField"

import type { InterviewSlotSharedForm } from "../types"

export function InterviewSlotDateField() {
  const { control } = useFormContext<InterviewSlotSharedForm>()

  return (
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
  )
}
