import { Button } from "@heroui/react"

import { NOTICE_TEXT } from "../constants"
import type { BookingNoticeStatus } from "../types"

interface Props {
  status: BookingNoticeStatus
  /** `failed` 일 때만 "다시 시도" 버튼을 보여준다 */
  onRetry?: () => void
}

export function BookingNotice({ status, onRetry }: Props) {
  const canRetry = status === "failed" && onRetry !== undefined

  return (
    <section className="mx-auto mt-16 flex w-full max-w-md flex-col items-center gap-5 text-center md:mt-28">
      <p className="text-base font-medium text-gray-900">
        {NOTICE_TEXT[status]}
      </p>
      {canRetry ? (
        <Button size="lg" onPress={onRetry}>
          다시 시도
        </Button>
      ) : null}
    </section>
  )
}
