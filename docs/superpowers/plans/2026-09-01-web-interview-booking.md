# 면접 예약 페이지 (apps/web) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 서류합격 메일의 토큰 링크로 진입한 지원자가 자기 직군의 면접 슬롯을 직접 선택·예약하는 페이지를 apps/web 에 만든다.

**Architecture:** 서버 셸(`app/interview/booking/page.tsx`)은 메타데이터만 갖고, `"use client"` 섹션 하나가 단일 상태 머신으로 화면 전체를 담당한다. Bearer 인증은 쿠키 기반 `@ddd/api` 와 분리해 `lib/api/interview-booking.ts` 의 로컬 fetch 모듈이 처리하고, 날짜 그룹핑·KST 포맷은 순수 헬퍼로 뽑아 검증 가능하게 둔다.

**Tech Stack:** Next.js 16 App Router, React 19, Emotion (`@emotion/styled`), 기존 `constants/tokens`

**Spec:** `docs/superpowers/specs/2026-09-01-web-interview-booking-design.md`
**BE 계약:** [DDD_BE#87](https://github.com/DDD-Community/DDD_BE/pull/87) — 머지 전이므로 openapi 생성 타입 없음, 수기 미러 사용

## Global Constraints

- API base: `/api/v1/interview-bookings`, 인증 `Authorization: Bearer <token>`
- 응답 봉투: `{ code, message, data }` — 모듈이 `data` 만 반환
- 에러 코드: `INTERVIEW_SLOT_FULL`(409) / `INTERVIEW_RESERVATION_EXISTS`(409) / `INTERVIEW_SLOT_CLOSED`(400) / `INTERVIEW_SLOT_NOT_FOUND`(404) / `INTERVIEW_BOOKING_NOT_ELIGIBLE`(403) / `UNAUTHORIZED`(401)
- **시간은 반드시 `timeZone: "Asia/Seoul"` 명시** — 브라우저 로컬 타임존 사용 금지
- 토큰은 컴포넌트 상태로만 보관 — storage 저장 금지
- apps/web 컨벤션: Emotion `styled`, `@/constants/tokens` 의 `colors`/`fontSizes`/`fontWeights`/`lineHeights`, 기본 폰트 Pretendard, 반응형 브레이크포인트 `1024/768/767px`
- 테스트 러너 없음 — 게이트는 `pnpm --filter @ddd/web build` + `pnpm lint`
- barrel 금지, 기존 파일 구조 관례 유지

---

### Task 1: API 모듈 + 순수 헬퍼

**Files:**
- Create: `apps/web/lib/api/interview-booking.ts`
- Create: `apps/web/lib/mappers/interviewBookingSlots.ts`

**Interfaces (Produces — Task 2·3 이 이 시그니처에 의존):**

```ts
// lib/api/interview-booking.ts
export type BookingSlot = { id: number; startAt: string; endAt: string; location?: string; remainingSeats: number }
export type BookingReservation = { id: number; slotId: number; startAt?: string; endAt?: string; location?: string }
export type BookingContext = { applicantName: string; partName: string; reservation: BookingReservation | null }
export class BookingApiError extends Error { readonly code: string; readonly status: number }
export function fetchBookingContext(token: string): Promise<BookingContext>
export function fetchBookingSlots(token: string): Promise<BookingSlot[]>
export function createBookingReservation(token: string, slotId: number): Promise<BookingReservation>

// lib/mappers/interviewBookingSlots.ts
export type BookingSlotGroup = { dateKey: string; dateLabel: string; slots: BookingSlot[] }
export function groupSlotsByKstDate(slots: BookingSlot[]): BookingSlotGroup[]
export function formatKstTimeRange(startAt: string, endAt?: string): string  // "14:00 ~ 14:40"
export function formatKstDateTime(startAt: string): string                   // "9월 10일 (수) 오후 2:00"
```

- [ ] **Step 1: fetch 모듈 작성**

  - base URL 은 `process.env.NEXT_PUBLIC_API_URL ?? window.location.origin` (클라이언트 전용). `lib/api/config.ts` 의 `ensureApiConfigured` 는 호출하지 않는다 — 그건 쿠키 기반 openapi 클라이언트용이고 이 모듈은 별개다. 그 이유를 파일 상단 주석에 남긴다.
  - 공통 `request()` 헬퍼: `Authorization: Bearer`, `Content-Type: application/json`, `credentials` 미지정(쿠키 불필요).
  - `res.ok` 가 아니면 봉투를 파싱해 `new BookingApiError(code, message, res.status)` 를 던진다. 파싱 실패 시 `code = "UNKNOWN_ERROR"`.
  - 성공 시 봉투의 `data` 를 반환. `data` 가 없으면 에러로 취급.

- [ ] **Step 2: 순수 헬퍼 작성**

  - `Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", ... })` 사용. 그룹 키는 KST 기준 `YYYY-MM-DD` (`formatToParts` 로 year/month/day 를 뽑아 조립 — `toISOString().slice(0,10)` 은 UTC 라 틀린다).
  - 그룹은 날짜 오름차순, 그룹 내 슬롯은 `startAt` 오름차순.
  - `dateLabel` 은 `9월 10일 (수)` 형태.

- [ ] **Step 3: 헬퍼 검증 (RED/GREEN 대용)**

  `node -e` 로 다음을 확인하고 출력을 report 에 남긴다 (tsx 없이 검증하려면 로직을 임시 JS 로 옮겨 실행해도 된다):
  - `2026-09-10T14:50:00Z` 와 `2026-09-10T15:10:00Z` → **다른 dateKey** (`2026-09-10` / `2026-09-11`)
  - `2026-09-10T05:00:00Z` → 시간 표기 `14:00`
  - 뒤섞인 입력 배열이 날짜·시간 오름차순으로 정렬되는지

- [ ] **Step 4: 게이트 + 커밋**

  `pnpm --filter @ddd/web build && pnpm lint`
  ```bash
  git add apps/web/lib/api/interview-booking.ts apps/web/lib/mappers/interviewBookingSlots.ts
  git commit -m "feat(web/interview-booking): 예약 API 모듈과 KST 슬롯 헬퍼 추가"
  ```

---

### Task 2: 페이지 셸 + 조회 상태 화면

**Files:**
- Create: `apps/web/app/interview/booking/page.tsx`
- Create: `apps/web/components/sections/InterviewBookingSection.tsx`

**Consumes:** Task 1 의 세 fetch 함수, `BookingApiError`, 그룹핑/포맷 헬퍼

**Produces:** `InterviewBookingSection` 내부 상태 머신 — Task 3 이 `confirming`/`done` 전이를 여기에 붙인다.

- [ ] **Step 1: page.tsx (서버 셸)**

  `metadata`: title `면접 시간 예약 | DDD`, `robots: { index: false, follow: false }`. Navigation/Footer 없이 `<main><InterviewBookingSection /></main>` 만. `useSearchParams` 를 쓰는 클라이언트 자식이 있으므로 `<Suspense>` 로 감싼다(Next 요구사항).

- [ ] **Step 2: 섹션 상태 머신 + 데이터 로딩**

  상태: `loading | invalid | expired | ineligible | booking | done | failed` (`confirming` 은 Task 3).
  - 마운트 시 `token` 없으면 `invalid`.
  - `fetchBookingContext` → `reservation` 있으면 `done`, 없으면 `fetchBookingSlots` 후 `booking`.
  - `BookingApiError` 의 `status === 401` → `expired`, `403` → `ineligible`, 그 외/네트워크 → `failed`.
  - `failed` 화면에 "다시 시도" 버튼(재조회).

- [ ] **Step 3: booking 화면 렌더**

  스펙 §5.1 대로: 헤더(`{applicantName}님, 면접 시간을 선택해주세요` + 직군), 날짜 그룹 헤딩, 시간 칩 그리드(모바일 2열/데스크톱 3~4열), `remainingSeats === 0` 은 disabled + `마감`, 잔여석 표기, 선택 강조, 하단 고정 CTA(선택 전 비활성). 슬롯 0건 빈 상태. 에러 배너 자리(문구 상태값)는 만들어두되 채우는 건 Task 3.
  `done` 화면도 이 태스크에서 렌더한다(스펙 §5.3).

- [ ] **Step 4: 게이트 + 커밋**

  `pnpm --filter @ddd/web build && pnpm lint`
  ```bash
  git add apps/web/app/interview/booking apps/web/components/sections/InterviewBookingSection.tsx
  git commit -m "feat(web/interview-booking): 예약 페이지 셸과 슬롯 목록·확정 화면 추가"
  ```

---

### Task 3: 확인 모달 + 예약 확정 플로우

**Files:**
- Create: `apps/web/components/modals/BookingConfirmModal.tsx`
- Modify: `apps/web/components/sections/InterviewBookingSection.tsx`

**Consumes:** Task 1 의 `createBookingReservation`/`BookingApiError`, Task 2 의 상태 머신

- [ ] **Step 1: 확인 모달**

  `PreAlertModal.tsx` 의 오버레이/포커스 처리 관례를 따른다(Esc 닫기, 오버레이 클릭 닫기, 열렸을 때 body 스크롤 잠금). 내용: 선택한 일시·장소 + **"확정 후에는 직접 변경·취소할 수 없어요. 변경이 필요하면 운영진에게 문의해주세요"** 경고 + [취소]/[예약 확정]. 확정 진행 중에는 버튼 비활성 + 라벨 전환.

- [ ] **Step 2: 확정 플로우 + 에러 매핑**

  CTA → `confirming`. 확정 시 `createBookingReservation(token, slotId)`:
  - 201 → `done` (응답 예약 정보로 확정 화면)
  - `INTERVIEW_RESERVATION_EXISTS` → `fetchBookingContext` 재조회 후 `done`
  - `INTERVIEW_SLOT_FULL` → `booking` + 배너 "방금 마감되었어요. 다른 시간을 골라주세요" + 슬롯 재조회 + 선택 해제
  - `INTERVIEW_SLOT_CLOSED` / `INTERVIEW_SLOT_NOT_FOUND` → `booking` + 배너(서버 `message`) + 슬롯 재조회 + 선택 해제
  - 401 → `expired`, 403 → `ineligible`
  - 그 외 → 모달 유지 + 모달 내 에러 문구 + 재시도 가능

- [ ] **Step 3: 게이트 + 커밋**

  `pnpm --filter @ddd/web build && pnpm lint`
  ```bash
  git add apps/web/components/modals/BookingConfirmModal.tsx apps/web/components/sections/InterviewBookingSection.tsx
  git commit -m "feat(web/interview-booking): 예약 확인 모달과 확정·경합 에러 처리 추가"
  ```
