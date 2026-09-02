import { useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  CONFIRM_RETRY_MESSAGE,
  RESERVATION_CHECK_FAILED_MESSAGE,
  SLOT_FULL_BANNER,
} from "../constants"
import { BookingApiError } from "../lib/bookingApi"
import {
  bookingKeys,
  bookingMutations,
  bookingQueries,
} from "../lib/bookingQueries"
import { groupSlotsByKstDate } from "../lib/slotGroups"
import type {
  BookingBlockedStatus,
  BookingContext,
  BookingReservation,
  BookingSlot,
} from "../types"

interface Args {
  token: string
  slots: BookingSlot[]
}

const BLOCKED_STATUS_BY_HTTP: Partial<Record<number, BookingBlockedStatus>> = {
  401: "expired",
  403: "ineligible",
}

/** 예약 직후 응답에 slot 정보가 비어 있으면 사용자가 방금 고른 슬롯 값으로 채운다. */
function withSlotFallback(
  reservation: BookingReservation,
  slot: BookingSlot
): BookingReservation {
  return {
    ...reservation,
    startAt: reservation.startAt ?? slot.startAt,
    endAt: reservation.endAt ?? slot.endAt,
    location: reservation.location ?? slot.location,
  }
}

/**
 * 슬롯 선택 → 확인 모달 → 확정 요청까지의 흐름과 확정 실패 매핑을 담당한다.
 *
 * - 201 → context 캐시에 예약을 써서 상위가 확정 화면으로 전환하게 한다
 * - `INTERVIEW_RESERVATION_EXISTS` → 다른 탭이 먼저 확정한 경우. context 를 다시 받아 확정 화면으로
 * - `INTERVIEW_SLOT_FULL` / `CLOSED` / `NOT_FOUND` → 선택 해제 + 슬롯 재조회 후 배너
 * - 401 / 403 → 예약 화면을 닫고 안내 문구만 보여준다 (`blockedStatus`)
 * - 그 외 → 모달을 유지한 채 재시도 문구만 채운다 (고른 슬롯을 잃지 않도록)
 */
export function useReserveSlotFlow({ token, slots }: Args) {
  const queryClient = useQueryClient()
  const reservationMutation = useMutation(bookingMutations.createReservation())

  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [blockedStatus, setBlockedStatus] =
    useState<BookingBlockedStatus | null>(null)

  const slotGroups = useMemo(() => groupSlotsByKstDate(slots), [slots])
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) ?? null
  const areAllSlotsFull =
    slots.length > 0 && slots.every((slot) => slot.remainingSeats === 0)
  const isConfirming = reservationMutation.isPending

  function selectSlot(slotId: number) {
    setSelectedSlotId(slotId)
  }

  function openConfirm() {
    if (selectedSlotId === null) return
    setConfirmError(null)
    setIsConfirmOpen(true)
  }

  function closeConfirm() {
    if (isConfirming) return
    setConfirmError(null)
    setIsConfirmOpen(false)
  }

  async function releaseSlotAndReload(message: string) {
    setSelectedSlotId(null)
    setIsConfirmOpen(false)
    setBanner(null)
    // 재조회가 끝난 뒤에 배너를 띄워야 "마감" 문구와 갱신된 잔여석이 같이 보인다.
    await queryClient.invalidateQueries({ queryKey: bookingKeys.slots(token) })
    setBanner(message)
  }

  async function adoptExistingReservation() {
    try {
      const context = await queryClient.fetchQuery(
        bookingQueries.context(token)
      )
      if (!context.reservation) {
        setConfirmError(RESERVATION_CHECK_FAILED_MESSAGE)
      }
    } catch {
      setConfirmError(RESERVATION_CHECK_FAILED_MESSAGE)
    }
  }

  async function handleReservationError(error: unknown) {
    if (!(error instanceof BookingApiError)) {
      setConfirmError(CONFIRM_RETRY_MESSAGE)
      return
    }

    const handlerByCode: Record<string, () => Promise<void>> = {
      INTERVIEW_RESERVATION_EXISTS: adoptExistingReservation,
      INTERVIEW_SLOT_FULL: () => releaseSlotAndReload(SLOT_FULL_BANNER),
      INTERVIEW_SLOT_CLOSED: () => releaseSlotAndReload(error.message),
      INTERVIEW_SLOT_NOT_FOUND: () => releaseSlotAndReload(error.message),
    }
    const handler = handlerByCode[error.code]
    if (handler) {
      await handler()
      return
    }

    const nextBlockedStatus = BLOCKED_STATUS_BY_HTTP[error.status]
    if (nextBlockedStatus) {
      setIsConfirmOpen(false)
      setBlockedStatus(nextBlockedStatus)
      return
    }

    setConfirmError(error.message || CONFIRM_RETRY_MESSAGE)
  }

  async function confirmReservation() {
    if (selectedSlot === null || isConfirming) return
    setConfirmError(null)

    try {
      const reservation = await reservationMutation.mutateAsync({
        token,
        slotId: selectedSlot.id,
      })
      queryClient.setQueryData<BookingContext>(
        bookingKeys.context(token),
        (previous) =>
          previous
            ? {
                ...previous,
                reservation: withSlotFallback(reservation, selectedSlot),
              }
            : previous
      )
    } catch (error) {
      await handleReservationError(error)
    }
  }

  return {
    slotGroups,
    areAllSlotsFull,
    selectedSlotId,
    selectedSlot,
    selectSlot,
    banner,
    isConfirmOpen,
    openConfirm,
    closeConfirm,
    confirmReservation,
    isConfirming,
    confirmError,
    blockedStatus,
  }
}
