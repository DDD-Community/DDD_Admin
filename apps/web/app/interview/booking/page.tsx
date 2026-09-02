import type { Metadata } from "next";
import { Suspense } from "react";
import { InterviewBookingSection } from "@/components/sections/InterviewBookingSection";

/**
 * 메일의 예약 링크(`?token=`)로만 진입하는 단일 목적 페이지라 색인 대상이 아니다.
 * Navigation/Footer 도 두지 않는다 — 예약 도중 이탈 경로만 만든다(설계 §3).
 */
export const metadata: Metadata = {
  title: "면접 시간 예약 | DDD",
  robots: { index: false, follow: false },
};

export default function InterviewBookingPage() {
  return (
    <main>
      {/* InterviewBookingSection 이 useSearchParams 를 쓰므로 Next 요구사항상 Suspense 로 감싼다. */}
      <Suspense fallback={null}>
        <InterviewBookingSection />
      </Suspense>
    </main>
  );
}
