import { Button } from "@heroui/react"
import { useSuspenseQuery } from "@tanstack/react-query"

import { useReserveSlotFlow } from "../hooks/useReserveSlotFlow"
import { bookingQueries } from "../lib/bookingQueries"
import type { BookingContext } from "../types"

import { BookingConfirmModal } from "./BookingConfirmModal"
import { BookingNotice } from "./BookingNotice"
import { BookingSlotList } from "./BookingSlotList"

interface Props {
  token: string
  context: BookingContext
}

export function BookingSlotSection({ token, context }: Props) {
  const { data: slots } = useSuspenseQuery(bookingQueries.slots(token))
  const flow = useReserveSlotFlow({ token, slots })

  if (flow.blockedStatus) {
    return <BookingNotice status={flow.blockedStatus} />
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {context.applicantName}님, 면접 시간을 선택해주세요
        </h1>
        <p className="text-base font-medium text-gray-500">
          {context.partName}
        </p>
      </header>

      <BookingSlotList
        slotGroups={flow.slotGroups}
        areAllSlotsFull={flow.areAllSlotsFull}
        selectedSlotId={flow.selectedSlotId}
        banner={flow.banner}
        onSelect={flow.selectSlot}
      />

      <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center border-t border-gray-200 bg-white px-4 py-4 md:px-6">
        <Button
          size="lg"
          className="w-full max-w-2xl"
          isDisabled={flow.selectedSlotId === null}
          onPress={flow.openConfirm}
        >
          이 시간으로 예약
        </Button>
      </div>

      {flow.selectedSlot ? (
        <BookingConfirmModal
          slot={flow.selectedSlot}
          isOpen={flow.isConfirmOpen}
          isConfirming={flow.isConfirming}
          errorMessage={flow.confirmError}
          onClose={flow.closeConfirm}
          onConfirm={() => void flow.confirmReservation()}
        />
      ) : null}
    </div>
  )
}
