"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import styled from "@emotion/styled";
import { colors, fontSizes, fontWeights, lineHeights } from "@/constants/tokens";
import {
  BookingApiError,
  fetchBookingContext,
  fetchBookingSlots,
  type BookingContext,
  type BookingSlot,
} from "@/lib/api/interview-booking";
import {
  formatKstDateTime,
  formatKstTimeRange,
  groupSlotsByKstDate,
} from "@/lib/mappers/interviewBookingSlots";

/**
 * 섹션 상태 머신 (설계 §5). `confirming` 은 Task 3 이 확인 모달과 함께 붙인다.
 *
 * - `loading`: 마운트 시 / "다시 시도" 후 context·slots 조회 중
 * - `invalid`: `token` 쿼리 없음
 * - `expired`: `GET /context` 401
 * - `ineligible`: `GET /context` 403
 * - `booking`: 예약 가능 — 슬롯 목록 + 하단 고정 CTA
 * - `done`: context 에 기존 예약이 있음(재접속 시에도 항상 이 화면)
 * - `failed`: 네트워크/5xx — 다시 시도 가능
 */
type SectionStatus = "loading" | "invalid" | "expired" | "ineligible" | "booking" | "done" | "failed";

const NOTICE_TEXT: Record<"invalid" | "expired" | "ineligible" | "failed", string> = {
  invalid: "잘못된 접근입니다. 메일의 예약 링크로 다시 들어와 주세요",
  expired: "링크가 만료되었습니다. 운영진에게 문의해주세요",
  ineligible: "지금은 예약할 수 있는 상태가 아니에요. 운영진에게 문의해주세요",
  failed: "정보를 불러오지 못했어요",
};

const Wrap = styled.div({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "80px 24px 160px",
  background: colors.textInverse,

  "@media (max-width: 767px)": {
    padding: "48px 16px 148px",
  },
});

const StateCard = styled.div({
  width: "100%",
  maxWidth: "480px",
  marginTop: "120px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  textAlign: "center",

  "@media (max-width: 767px)": {
    marginTop: "64px",
  },
});

const StateText = styled.p({
  margin: 0,
  color: colors.textPrimary,
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphMedium,
});

const RetryButton = styled.button({
  height: "52px",
  padding: "0 32px",
  borderRadius: "100px",
  border: "none",
  background: colors.primary,
  color: colors.textInverse,
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.medium,
  cursor: "pointer",

  "&:hover": {
    background: "#1f5fe0",
  },
});

const BookingWrap = styled.div({
  width: "100%",
  maxWidth: "640px",
  display: "flex",
  flexDirection: "column",
  gap: "40px",
});

const Header = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

const HeaderTitle = styled.h1({
  margin: 0,
  color: colors.textPrimary,
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.bold,
  lineHeight: lineHeights.headingLarge,
});

const HeaderSubtitle = styled.p({
  margin: 0,
  color: colors.textSecondary,
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphMedium,
});

const Banner = styled.div({
  padding: "16px 20px",
  borderRadius: "12px",
  background: "#fff1f1",
  color: "#c0392b",
  fontSize: fontSizes.small,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.small,
});

const EmptyState = styled.p({
  margin: 0,
  padding: "40px 0",
  color: colors.textSecondary,
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphMedium,
  textAlign: "center",
});

const DateGroupList = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "32px",
});

const DateGroup = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
});

const DateGroupHeading = styled.h2({
  margin: 0,
  color: colors.textPrimary,
  fontSize: fontSizes.large,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.paragraphLarge,
});

const SlotGrid = styled.div({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "12px",

  "@media (max-width: 1024px)": {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
  "@media (max-width: 767px)": {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
});

const SlotChip = styled.button<{ selected: boolean }>(({ selected }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  height: "72px",
  borderRadius: "12px",
  border: selected ? `1.5px solid ${colors.primary}` : `1.5px solid ${colors.slate300}`,
  background: selected ? colors.mainLight : colors.textInverse,
  color: selected ? colors.primary : colors.textPrimary,
  cursor: "pointer",

  "&:disabled": {
    borderColor: colors.slate200,
    background: colors.slate200,
    color: colors.textSecondary,
    cursor: "not-allowed",
  },
}));

const SlotTime = styled.span({
  fontSize: fontSizes.medium,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.paragraphMedium,
});

const SlotSeats = styled.span({
  fontSize: "12px",
  fontWeight: fontWeights.regular,
  lineHeight: "15px",
  color: "inherit",
  opacity: 0.8,
});

const CtaBar = styled.div({
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  justifyContent: "center",
  padding: "16px 24px",
  background: colors.textInverse,
  borderTop: `1px solid ${colors.slate200}`,
  zIndex: 10,
});

const CtaButton = styled.button({
  width: "100%",
  maxWidth: "640px",
  height: "60px",
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

const DoneCard = styled.div({
  width: "100%",
  maxWidth: "480px",
  marginTop: "80px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
  padding: "40px 32px",
  borderRadius: "20px",
  border: `1px solid ${colors.slate200}`,
  textAlign: "center",

  "@media (max-width: 767px)": {
    marginTop: "40px",
    padding: "32px 20px",
  },
});

const DoneTitle = styled.h1({
  margin: 0,
  color: colors.textPrimary,
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.bold,
  lineHeight: lineHeights.headingLarge,
});

const DoneDetailList = styled.dl({
  margin: 0,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

const DoneDetailRow = styled.div({
  display: "flex",
  justifyContent: "center",
  gap: "8px",
  fontSize: fontSizes.medium,
  lineHeight: lineHeights.paragraphMedium,
});

const DoneDetailLabel = styled.dt({
  margin: 0,
  color: colors.textSecondary,
  fontWeight: fontWeights.medium,
});

const DoneDetailValue = styled.dd({
  margin: 0,
  color: colors.textPrimary,
  fontWeight: fontWeights.semiBold,
});

const DoneNotice = styled.p({
  margin: 0,
  color: colors.textSecondary,
  fontSize: fontSizes.small,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.small,
});

export const InterviewBookingSection = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<SectionStatus>("loading");
  const [context, setContext] = useState<BookingContext | null>(null);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  /** 목록 상단 인라인 에러 배너 문구 — Task 3 이 409/400/404 케이스에서 채운다. */
  const [banner, setBanner] = useState<string | null>(null);
  /** "다시 시도" 버튼이 이 값을 올려 재조회 effect 를 다시 태운다. */
  const [reloadCount, setReloadCount] = useState(0);

  // 재조회 함수를 useCallback 으로 밖에 빼지 않고 effect 안에 그대로 둔다 — 밖으로 빼면
  // 클린업 시점의 stale 응답(예: token 이 바뀐 뒤 늦게 도착한 이전 요청)이 최신 상태를
  // 덮어써 화면이 엇갈릴 수 있다. `ignore` 플래그로 그 경합을 막는다.
  useEffect(
    function loadBookingOnTokenOrReload() {
      let ignore = false;

      async function loadBooking() {
        if (!token) {
          setStatus("invalid");
          return;
        }

        setStatus("loading");
        setBanner(null);

        try {
          const nextContext = await fetchBookingContext(token);
          if (ignore) return;
          setContext(nextContext);

          if (nextContext.reservation) {
            setStatus("done");
            return;
          }

          const nextSlots = await fetchBookingSlots(token);
          if (ignore) return;
          setSlots(nextSlots);
          setSelectedSlotId(null);
          setStatus("booking");
        } catch (error) {
          if (ignore) return;
          if (error instanceof BookingApiError) {
            if (error.status === 401) {
              setStatus("expired");
              return;
            }
            if (error.status === 403) {
              setStatus("ineligible");
              return;
            }
          }
          setStatus("failed");
        }
      }

      void loadBooking();

      return () => {
        ignore = true;
      };
    },
    [token, reloadCount],
  );

  const slotGroups = useMemo(() => groupSlotsByKstDate(slots), [slots]);

  if (status === "loading") {
    return (
      <Wrap>
        <StateCard>
          <StateText>불러오는 중이에요…</StateText>
        </StateCard>
      </Wrap>
    );
  }

  if (status === "invalid" || status === "expired" || status === "ineligible" || status === "failed") {
    return (
      <Wrap>
        <StateCard>
          <StateText>{NOTICE_TEXT[status]}</StateText>
          {status === "failed" ? (
            <RetryButton type="button" onClick={() => setReloadCount((count) => count + 1)}>
              다시 시도
            </RetryButton>
          ) : null}
        </StateCard>
      </Wrap>
    );
  }

  if (status === "done") {
    const reservation = context?.reservation ?? null;

    return (
      <Wrap>
        <DoneCard>
          <DoneTitle>예약이 확정되었어요</DoneTitle>
          <DoneDetailList>
            <DoneDetailRow>
              <DoneDetailLabel>일시</DoneDetailLabel>
              <DoneDetailValue>
                {reservation?.startAt ? formatKstDateTime(reservation.startAt) : "안내 예정"}
              </DoneDetailValue>
            </DoneDetailRow>
            <DoneDetailRow>
              <DoneDetailLabel>장소</DoneDetailLabel>
              <DoneDetailValue>{reservation?.location || "안내 예정"}</DoneDetailValue>
            </DoneDetailRow>
          </DoneDetailList>
          <DoneNotice>
            확정 안내 메일을 보내드렸어요(캘린더 초대 포함).
            <br />
            변경이 필요하면 운영진에게 문의해주세요.
          </DoneNotice>
        </DoneCard>
      </Wrap>
    );
  }

  // status === "booking"
  return (
    <Wrap>
      <BookingWrap>
        <Header>
          <HeaderTitle>{context?.applicantName}님, 면접 시간을 선택해주세요</HeaderTitle>
          <HeaderSubtitle>{context?.partName}</HeaderSubtitle>
        </Header>

        {banner ? <Banner role="alert">{banner}</Banner> : null}

        {slotGroups.length === 0 ? (
          <EmptyState>아직 열린 면접 시간이 없어요. 운영진에게 문의해주세요</EmptyState>
        ) : (
          <DateGroupList>
            {slotGroups.map((group) => (
              <DateGroup key={group.dateKey}>
                <DateGroupHeading>{group.dateLabel}</DateGroupHeading>
                <SlotGrid>
                  {group.slots.map((slot) => {
                    const isFull = slot.remainingSeats === 0;
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <SlotChip
                        key={slot.id}
                        type="button"
                        selected={isSelected}
                        disabled={isFull}
                        aria-pressed={isSelected}
                        onClick={() => setSelectedSlotId(slot.id)}
                      >
                        <SlotTime>{formatKstTimeRange(slot.startAt, slot.endAt)}</SlotTime>
                        <SlotSeats>{isFull ? "마감" : `${slot.remainingSeats}자리 남음`}</SlotSeats>
                      </SlotChip>
                    );
                  })}
                </SlotGrid>
              </DateGroup>
            ))}
          </DateGroupList>
        )}
      </BookingWrap>

      <CtaBar>
        <CtaButton type="button" disabled={selectedSlotId === null} onClick={() => {}}>
          이 시간으로 예약
        </CtaButton>
      </CtaBar>
    </Wrap>
  );
};
