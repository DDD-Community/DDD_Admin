import { Suspense, useEffect } from "react"
import { QueryErrorResetBoundary } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"
import { useSearchParams } from "react-router"

import { InterviewBookingContent } from "./InterviewBookingContent"
import { BookingErrorFallback } from "./components/BookingErrorFallback"
import { BookingLoading } from "./components/BookingLoading"
import { BookingNotice } from "./components/BookingNotice"
import { PAGE_TITLE } from "./constants"

/**
 * 서류 합격 메일의 예약 링크(`/interview?token=`)로만 진입하는 지원자용 공개 페이지.
 * `AdminLayout` 바깥 라우트라 로그인 가드·사이드바가 없다. 토큰은 URL 에 그대로 둔다 —
 * 지우면 새로고침 시 재진입이 깨진다.
 */
export default function InterviewBookingPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  useEffect(function replaceDocumentTitleWhileMounted() {
    const previousTitle = document.title
    document.title = PAGE_TITLE
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <main className="min-h-screen w-full bg-white px-4 pt-12 pb-40 md:px-6 md:pt-20">
      <div className="mx-auto w-full max-w-2xl">
        {token ? (
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                FallbackComponent={BookingErrorFallback}
              >
                <Suspense fallback={<BookingLoading />}>
                  <InterviewBookingContent token={token} />
                </Suspense>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        ) : (
          <BookingNotice status="invalid" />
        )}
      </div>
    </main>
  )
}
