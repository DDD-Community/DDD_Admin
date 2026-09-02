"use client";

import { useEffect } from "react";
import styled from "@emotion/styled";
import { colors, fontSizes, fontWeights, lineHeights } from "@/constants/tokens";
import type { BookingSlot } from "@/lib/api/interview-booking";
import { formatKstDateTime } from "@/lib/mappers/interviewBookingSlots";

/**
 * 예약 확인 모달 (설계 §5.2). `InterviewBookingSection` 의 `confirming` 상태에서만
 * 마운트되는 순수 프레젠테이션 컴포넌트 — 열림/닫힘은 부모가 마운트 여부로 제어한다.
 *
 * 오버레이 클릭 닫기·Esc 닫기·body 스크롤 잠금 관례는 `PreAlertModal.tsx` 를 따른다.
 * 단, 확정 요청이 진행 중(`confirming=true`)일 때는 실수로 닫아 예약을 잃지 않도록
 * 두 경로 모두 막는다 — 대신 취소/확정 버튼도 함께 비활성화한다.
 */

type BookingConfirmModalProps = {
  slot: BookingSlot;
  /** POST /reservations 요청이 진행 중인지 — true 면 버튼 비활성 + 라벨 전환, 닫기 불가 */
  confirming: boolean;
  /** 재시도 가능한(네트워크/미분류) 에러 문구 — 모달을 유지한 채 표시한다 */
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

const Overlay = styled.div({
  position: "fixed",
  inset: 0,
  zIndex: 1200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(12, 14, 15, 0.72)",
  padding: "24px",
});

const ModalCard = styled.div({
  width: "100%",
  maxWidth: "400px",
  background: colors.textInverse,
  borderRadius: "24px",
  padding: "40px 32px 32px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",

  "@media (max-width: 767px)": {
    borderRadius: "20px",
    padding: "32px 20px 24px",
  },
});

const Title = styled.h2({
  margin: 0,
  color: colors.textPrimary,
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.bold,
  lineHeight: lineHeights.headingLarge,
  textAlign: "center",
});

const DetailList = styled.dl({
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

const DetailRow = styled.div({
  display: "flex",
  justifyContent: "center",
  gap: "8px",
  fontSize: fontSizes.medium,
  lineHeight: lineHeights.paragraphMedium,
});

const DetailLabel = styled.dt({
  margin: 0,
  color: colors.textSecondary,
  fontWeight: fontWeights.medium,
});

const DetailValue = styled.dd({
  margin: 0,
  color: colors.textPrimary,
  fontWeight: fontWeights.semiBold,
});

const WarningText = styled.p({
  margin: 0,
  padding: "12px 16px",
  borderRadius: "12px",
  background: "#fff1f1",
  color: "#c0392b",
  fontSize: fontSizes.small,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.small,
});

const ErrorText = styled.p({
  margin: 0,
  color: "#c0392b",
  fontSize: fontSizes.small,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.small,
  textAlign: "center",
});

const ActionRow = styled.div({
  display: "flex",
  gap: "12px",
});

const CancelButton = styled.button({
  flex: 1,
  height: "52px",
  borderRadius: "100px",
  border: "none",
  background: colors.slate200,
  color: colors.textPrimary,
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.medium,
  cursor: "pointer",

  "&:disabled": {
    cursor: "not-allowed",
    opacity: 0.6,
  },
});

const ConfirmButton = styled.button({
  flex: 1,
  height: "52px",
  borderRadius: "100px",
  border: "none",
  background: colors.primary,
  color: colors.textInverse,
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.medium,
  cursor: "pointer",

  "&:disabled": {
    background: colors.disabled,
    cursor: "not-allowed",
  },
});

export const BookingConfirmModal = ({
  slot,
  confirming,
  errorMessage,
  onCancel,
  onConfirm,
}: BookingConfirmModalProps) => {
  useEffect(
    function closeOnEscapeWhileIdle() {
      const escHandler = (event: KeyboardEvent) => {
        if (event.key !== "Escape" || confirming) return;
        onCancel();
      };

      window.addEventListener("keydown", escHandler);
      return () => window.removeEventListener("keydown", escHandler);
    },
    [confirming, onCancel],
  );

  useEffect(function lockBodyScrollWhileMounted() {
    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const onBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || confirming) return;
    onCancel();
  };

  return (
    <Overlay onClick={onBackdropClick}>
      <ModalCard role="dialog" aria-modal="true" aria-label="예약 확인 모달">
        <Title>이 시간으로 예약할까요?</Title>

        <DetailList>
          <DetailRow>
            <DetailLabel>일시</DetailLabel>
            <DetailValue>{formatKstDateTime(slot.startAt)}</DetailValue>
          </DetailRow>
          {slot.location ? (
            <DetailRow>
              <DetailLabel>장소</DetailLabel>
              <DetailValue>{slot.location}</DetailValue>
            </DetailRow>
          ) : null}
        </DetailList>

        <WarningText>
          확정 후에는 직접 변경·취소할 수 없어요. 변경이 필요하면 운영진에게 문의해주세요
        </WarningText>

        {errorMessage ? <ErrorText role="alert">{errorMessage}</ErrorText> : null}

        <ActionRow>
          <CancelButton type="button" disabled={confirming} onClick={onCancel}>
            취소
          </CancelButton>
          <ConfirmButton type="button" disabled={confirming} onClick={onConfirm}>
            {confirming ? "확정 중…" : "예약 확정"}
          </ConfirmButton>
        </ActionRow>
      </ModalCard>
    </Overlay>
  );
};
