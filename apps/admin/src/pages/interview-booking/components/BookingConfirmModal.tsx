import { Alert, Button, Modal } from "@heroui/react"

import { NO_INFO_PLACEHOLDER } from "../constants"
import { formatKstDateTime } from "../lib/slotGroups"
import type { BookingSlot } from "../types"

interface Props {
  slot: BookingSlot
  isOpen: boolean
  /** 확정 요청 진행 중 — 버튼 비활성 + 백드롭·Esc 닫기 차단으로 예약을 잃지 않게 한다 */
  isConfirming: boolean
  /** 재시도 가능한 에러 문구. 모달을 유지한 채 보여준다 */
  errorMessage: string | null
  onClose: () => void
  onConfirm: () => void
}

export function BookingConfirmModal({
  slot,
  isOpen,
  isConfirming,
  errorMessage,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop
        isDismissable={!isConfirming}
        isKeyboardDismissDisabled={isConfirming}
      >
        <Modal.Container size="sm">
          <Modal.Dialog aria-label="예약 확인">
            <Modal.Header>
              <Modal.Heading>이 시간으로 예약할까요?</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <dl className="flex flex-col gap-2 text-base">
                <div className="flex justify-center gap-2">
                  <dt className="font-medium text-gray-500">일시</dt>
                  <dd className="font-semibold text-gray-900">
                    {formatKstDateTime(slot.startAt)}
                  </dd>
                </div>
                <div className="flex justify-center gap-2">
                  <dt className="font-medium text-gray-500">장소</dt>
                  <dd className="font-semibold text-gray-900">
                    {slot.location || NO_INFO_PLACEHOLDER}
                  </dd>
                </div>
              </dl>
              <Alert status="warning">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>
                    확정 후에는 직접 변경·취소할 수 없어요. 변경이 필요하면
                    운영진에게 문의해주세요
                  </Alert.Description>
                </Alert.Content>
              </Alert>
              {errorMessage ? (
                <p
                  role="alert"
                  className="text-center text-sm font-medium text-red-600"
                >
                  {errorMessage}
                </p>
              ) : null}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline"
                isDisabled={isConfirming}
                onPress={onClose}
              >
                취소
              </Button>
              <Button isPending={isConfirming} onPress={onConfirm}>
                {isConfirming ? "확정 중…" : "예약 확정"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
