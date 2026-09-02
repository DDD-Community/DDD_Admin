import { Alert, ToggleButton } from "@heroui/react"

import { cn } from "@/shared/lib/cn"

import { formatKstTimeRange } from "../lib/slotGroups"
import type { BookingSlotGroup } from "../lib/slotGroups"

interface Props {
  slotGroups: BookingSlotGroup[]
  areAllSlotsFull: boolean
  selectedSlotId: number | null
  banner: string | null
  onSelect: (slotId: number) => void
}

export function BookingSlotList({
  slotGroups,
  areAllSlotsFull,
  selectedSlotId,
  banner,
  onSelect,
}: Props) {
  if (slotGroups.length === 0) {
    return (
      <p className="py-10 text-center text-base font-medium text-gray-500">
        아직 열린 면접 시간이 없어요. 운영진에게 문의해주세요
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {banner ? (
        <Alert status="danger" role="alert">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{banner}</Alert.Title>
          </Alert.Content>
        </Alert>
      ) : null}

      {areAllSlotsFull ? (
        <p className="py-10 text-center text-base font-medium text-gray-500">
          현재 예약 가능한 시간이 모두 마감되었어요. 운영진에게 문의해주세요
        </p>
      ) : null}

      {slotGroups.map((group) => (
        <section key={group.dateKey} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {group.dateLabel}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {group.slots.map((slot) => {
              const isFull = slot.remainingSeats === 0
              const isSelected = selectedSlotId === slot.id
              const timeRange = formatKstTimeRange(slot.startAt, slot.endAt)
              const seatsText = isFull
                ? "마감"
                : `${slot.remainingSeats}자리 남음`
              return (
                <ToggleButton
                  key={slot.id}
                  aria-label={`${group.dateLabel} ${timeRange}, ${seatsText}`}
                  isSelected={isSelected}
                  isDisabled={isFull}
                  onChange={() => onSelect(slot.id)}
                  className={cn(
                    "h-auto min-h-18 w-full flex-col gap-1 rounded-xl py-3",
                    isSelected && "border-primary"
                  )}
                >
                  <span className="text-base font-semibold">{timeRange}</span>
                  <span className="text-xs opacity-80">{seatsText}</span>
                </ToggleButton>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
