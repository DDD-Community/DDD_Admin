# DDD 프론트엔드 진행 현황

> **기준 문서**: 어드민 기능 명세 3.x, SEO 요구사항 4.x, 데이터 모델 5.x, MVP 범위 6.x
> **코드 스냅샷**: 2026-05-12 (branch: `dev/admin`)
> **범례**: ✅ 완료 / 🔧 부분 구현 (UI만 또는 목업 연결) / ⬜ 미구현

---

## 어드민 화면 레퍼런스

`apps/admin`의 신규 페이지 / 리뉴얼 작업은 다음 HTML 목업을 단일 시각 레퍼런스로 사용한다.

- **파일**: `~/Downloads/ddd-admin (1) (1).html` (별도 보존; 외부 공유 금지)
- **포함 페이지**: 기수 / 사전 알림 / 지원자 / 프로젝트 / 블로그 + 각 영역 Drawer · Confirm Modal · Toast
- **개발 원칙**
  - 컬럼·필터·필드 구성은 HTML을 따르되, 데이터 형태·필드명은 `@ddd/api` DTO에 정합되게 변환한다.
  - HTML에만 존재하지만 백엔드 DTO에 없는 필드(예: 프로젝트/블로그 `status`)는 **노출하지 않는다.**
  - HTML이 page-number 페이지네이션을 그리더라도 백엔드가 cursor 페이지네이션이면 "더 보기" / 무한스크롤로 대체한다.
  - 토스트·확인 모달은 **HeroUI v3** 기본 컴포넌트로 구현한다 (별도 토스트 가이드는 [docs/admin-toast.md](./docs/admin-toast.md) 참조).
- **세부 설계 문서**: [docs/superpowers/specs/2026-04-26-blog-projects-admin-design.md](./docs/superpowers/specs/2026-04-26-blog-projects-admin-design.md) — `/projects`, `/blog-posts` 페이지의 11단계 구현 계획 포함.

---

## 한눈에 보기

| 영역 | 상태 | 핵심 갭 |
| --- | --- | --- |
| 공통 인프라 (admin) | ✅ | 모든 도메인이 openapi-fetch 기반 `api` 싱글톤으로 통일 (commit 241ae4e). storage 보조 queries(`listFiles`·`deleteFile`·`createSignedUrl`·`downloadFile`) 는 후속 |
| 3.1 기수 관리 | ✅ | 목록/통계/등록/수정/상태변경/파트양식 저장 완료. 부분 실패(`PartsSaveAfterCreateError`) 시 edit 모드 자동 전환 — 브라우저 검증 미실시 |
| 3.2 사전 알림 | 🔧 | 일괄 발송·CSV·캠페인(PAUSED↔SCHEDULED 전환·편집) ✅, 개별 발송 액션 컬럼 부재 (BE 엔드포인트 없음) |
| 3.3 지원자 관리 | ✅ | 목록·필터·Drawer 상세·합격불합격 분기·면접일자 컬럼(슬롯 예약 join) 완료. 개인정보 동의 일자 표시 |
| 3.3.5 면접 슬롯 | ✅ | `/interview-slots` 신설 — 기수·파트 필터 + CRUD + Drawer + Dialog. `INTERVIEW_SLOTS_NOT_READY` → `InterviewSlotsRequiredModal` 로 페이지 navigate. 예약자 목록·예약 취소는 `ReservationsDrawer` + `CancelReservationDialog` 로 완료 |
| 3.4 프로젝트 DB | ✅ | 코드 완료 (브라우저 회귀 테스트 미실시) — PDF 업로드는 후속 |
| 3.5 블로그 DB | ✅ | 코드 완료 (브라우저 회귀 테스트 미실시) |
| 3.6 FAQ | ✅ | MVP 제외 결정 (FE 하드코딩) |
| 5. 데이터 모델 타입 반영 | 🔧 | `@ddd/api` 생성 타입 도입 진행 중 — `pages/semesters/types.d.ts` 임시 타입 잔존 |

---

## 공통 인프라 (apps/admin)

**완료**

- Vite + React 19 + TypeScript
- Tailwind CSS 4
- HeroUI v3 (shadcn/ui primitives 제거 완료)
- React Router Data Mode (`createBrowserRouter`) — `apps/admin/src/pages/index.tsx`
- TanStack Query (`QueryProvider`)
- MSW 목업 환경 — `apps/admin/src/mocks/`
- ESLint + Prettier + Lefthook
- pages/shared 2단 디렉터리 구조 (페이지 콜로케이션, FSD 폐기)
- `AdminLayout` (SideBar + MobileHeader + Outlet)

**API 레이어 연동 현황**

> commit 241ae4e (`orval → openapi-typescript + openapi-fetch` 마이그레이션) 이후 orval 시절의 generated 함수(`cohortGetAdminList` 등)는 제거됨. 현재 `packages/api/src/generated/api.ts` 는 `paths` 타입 정의 한 파일만 보관하며, 모든 도메인은 `import { api } from "../fetchClient"` → `api.get/post/patch/put/delete(...)` 호출 패턴으로 통일되어 있다.

- ✅ 전 도메인 (`application` · `blog` · `project` · `early-notification` · `discord` · `interview` · `cohort` · `auth` · `storage` · `notification-campaign` · `users`) — `fetchClient` `api` 싱글톤 사용, 패턴 일관
- ✅ **notification-campaign** — `packages/api/src/notification-campaign/` SDK + 어드민 UI(`/early-notification` 페이지 안 캠페인 섹션: 목록·편집 Drawer·PAUSED↔SCHEDULED 토글) 연결 완료
- ⬜ **storage 보조 queries** — `listFiles`·`deleteFile`·`createSignedUrl`·`downloadFile` 미구현 (BE 엔드포인트 추가 후 진행)

**완료 (인프라)**

- ✅ Google OAuth 실제 연결 — `LoginPage` 가 `/api/v1/auth/google` 로 top-level navigation (same-origin), 백엔드가 `CLIENT_REDIRECT_URL` 로 되돌림 (httpOnly 쿠키)
- ✅ 인증 보호 라우트 (Minimal) — 별도 loader 가드 없이 `client.ts` 401 인터셉터 + `main.tsx` `onUnauthorized` 콜백에 위임. 401 발생 시 `paths.login` 으로 자동 redirect
- ✅ 사이드바 사용자 메뉴 드롭다운 + 로그아웃 흐름 — `shared/ui/AdminLayout/UserMenuDropdown.tsx` + `shared/hooks/useLogoutFlow.ts` (`@ddd/api` `useLogout` mutation → 토스트 → `paths.login` redirect)
- ✅ same-origin 배포 환경 코드 준비 — `client.ts` `buildUrl()` 이 `window.location.origin` 자동 결합, Vite dev proxy (`/api → localhost:3000`), `.github/workflows/deploy-admin.yml` (SCP + atomic swap). 머지 전 GitHub Secrets 등록 + BE 측 Caddy/compose 부트스트랩 필요 — 단일 출처: [docs/admin-deploy.md](./docs/admin-deploy.md)

**비-목표 (별도 라운드)**

- 회원가입 — 별도 흐름 없음 (Google OAuth 첫 로그인이 곧 가입)
- 로그인 사용자 컨텍스트 (me 표시) — 백엔드 `GET /api/v1/users/me` 추가 합의됨 (별도 PR 에서 옵션 A 가드 도입 예정)
- 회원 탈퇴 UI — 별도 라운드
- 권한(roles) 기반 접근 제어 — 별도 라운드

---

## 3.1 기수 관리 (`/semesters`)

### 3.1.1 기수 상태 정의

- ✅ 상태 Enum 표기 (모집예정 / 모집 중 / 활동 중 / 활동종료) — 테이블 컬럼 노출
- ⬜ 홈페이지 버튼 동기화 (사전 알림 신청 / 지원 신청 / 모집 종료) — 웹 측 책임

### 3.1.2 기수 등록/수정

- ✅ 기수 목록 조회 — `useSemestersTableData` (`useCohorts` + 기수별 지원자/멤버 집계) 연동
- ✅ 상태별 필터 / 기수 검색 (클라이언트)
- ✅ 통계 카드 — `useSemestersTableData.summary`로 동적 집계 (전체 기수 / 현재 상태 / 누적 지원자 / 누적 멤버)
- ✅ 새 기수 등록 폼 — `SemesterRegisterDrawer` RHF + `useCreateOrUpdateCohortFlow` (`useCreateCohort`/`useUpdateCohort`) 연동
- ✅ 새 기수 등록 버튼 — `SemestersPage.tsx:77-85` `onPress` 연결, Drawer 정상 오픈
- 🔧 프로세스 일정 등록/수정 — ProcessSection DateRangePicker/DatePicker RHF 연결, API 직렬화 브라우저 검증 미실시
- 🔧 커리큘럼 등록/수정 — CurriculumSection (9주차 고정) RHF 연결, 브라우저 검증 미실시
- ✅ 파트별 지원서 양식 관리 (PM/PD/Server/Web/iOS/Android Tabs) — `ApplicationFormSection` 에 label TextArea + required Switch + isOpen Switch (key Input 제거). 저장 직전 `serializeFormToPartsPayload` 가 빈 key 를 `slugify(label)` 결과로 자동 생성(한글 그대로 허용, 예: `지원_동기`). 저장된 question 은 label 이 `isReadOnly`, 카드에 `저장됨: <key>` caption 노출. Drawer `onSubmit` 게이트가 `validateFormParts` 로 빈 label·part 내부 중복 key 를 클라에서 차단 + `toast.danger` + 위반 카드 `border-danger` 강조. `useCreateOrUpdateCohortFlow` 가 create/update 후 `updateCohortParts` 호출, 부분 실패 시 `PartsSaveAfterCreateError` throw → 호출부가 edit 모드로 전환. `cohort.applicationForm` 은 dead 필드로 제거 — 단일 source 는 `PUT /admin/cohorts/{id}/parts` ([정책](./docs/admin-cohort-parts-policy.md))
- ✅ 수동 상태 변경 버튼 ("모집중 전환") — `useTransitionCohortStatusFlow` 연동. RECRUITING 전환 시 `validateCohortPartsForRecruiting` 가드(isOpen 파트 0개 또는 양식 비어있는 파트가 있으면 mutation 호출 없이 `TransitionBlockedDialog` 노출 → "수정 화면 열기" 시 해당 cohort edit Drawer 자동 오픈). 위반 파트 자동 스크롤·강조는 후속 PR
- ✅ 기수 수정 버튼 — `editTarget` state + `isDrawerOpen`, Drawer `mode="edit"` 분기 완성
- ✅ `SemesterRegisterDrawer` react-hook-form + FormProvider 도입
- ⬜ 모집 종료일 경과 시 자동 "활동중" 전환 (백엔드/스케줄러 책임)

---

## 3.2 사전 알림 신청 관리 (`/reminders`)

- ✅ 신청자 목록 조회 (이메일 / 기수 / 신청일 / 상태 / 발송 일시) — `useAdminEarlyNotifications` 연동
- ✅ 상태별 필터 (전체 / 대기 / 발송완료) — 클라이언트 predicate
- ✅ 이메일 검색 (클라이언트, 부분 일치)
- ✅ 통계 카드 — 동적 집계 (`EarlyNotificationStatsSection.tsx:22` `stats` useMemo)
- ✅ 기수별 필터 — `useCohorts()` 매핑 + 최신 모집기수 자동 선택 (`pickActiveCohortId`)
- ✅ 전체 일괄 발송 — `RemindersBulkSendDrawer.tsx:62` `useSendBulkEarlyNotification` mutation 연동
- ⬜ 개별 발송 버튼 — `RemindersTable.tsx:28-34` 헤더에 액션 컬럼 자체가 없음 (HTML 목업에는 있음)
- ✅ 이메일 목록 CSV 다운로드 — `useDownloadEarlyNotificationsCsv` 훅 + `earlyNotificationQueries` 팩토리 경유. `EarlyNotificationToolbar` 버튼 연동
- ⬜ 개별 발송 — **백엔드 generated에 단건 발송 엔드포인트 없음**. 백엔드 추가 후 구현 가능
- ✅ 캠페인(예약 발송) 관리 — `NotificationCampaignSection` (목록·상태 배지·편집 Drawer·PAUSED↔SCHEDULED 토글). 기수 생성 시 자동 생성된 캠페인을 운영자가 본문·시각 수정 후 SCHEDULED 로 풀면 백엔드 스케줄러가 자동 발송
- ⬜ 기수 상태 "모집중" 전환 시 **즉시** 자동 발송 (Phase 2 — 현재는 캠페인 scheduledAt 기반)

---

## 3.3 지원자 및 지원서 관리 (`/applications`)

### 3.3.1 지원자 상태 정의

- 🔧 상태 값 일부 노출 — 명세 전체 enum(서류대기 / 서류합격 / 서류불합격 / 면접합격 / 최종합격 / 최종불합격 / 활동중 / 활동완료 / 활동중단) 정합성 재검수 필요

### 3.3.2 지원자 목록

- ✅ 목록 조회 (이름 / 연락처 / 파트 / 기수 / 지원일 / 상태) — `useAdminApplications` 연동
- ✅ 상태별 필터, 이름·연락처 검색 (클라이언트), 파트별/기수별 필터
- ✅ 통계 카드 — `ApplicationsPage.tsx:76-83` 에서 cardList 기반 동적 집계
- ✅ 지원자 행 클릭 → `ApplicationDetailDrawer` 오픈 — `ApplicationsPage` `onRowPress` + `selectedApplicationId` state 연결
- ⬜ 지원자 이름 행 hover 하이라이트 스타일 없음 (`cursor-pointer` 만 적용)

### 3.3.3 지원자 상세 (Drawer 방식, 별도 라우트 없음)

- ✅ `ApplicationDetailDrawer` — `/applications` 내에서 슬라이드 패널로 진입 (별도 라우트 불필요)
- ✅ 지원 파트 / 이름 / 휴대폰번호(가운데번호 마스킹) / 생년월일 / 거주지역 / 제출일 표시
- ✅ 파트별 질문+답변 — `AnswerList.tsx` (answers Record 렌더링)
- ✅ 개인정보 동의 여부 — `privacyAgreed` boolean 표시
- ✅ 개인정보 동의 일시 — `ApplicationDetailDrawer/index.tsx` `InfoRow` 로 `privacyAgreedAt` 렌더링 (BE 미응답 시 `formatDate` 폴백 `"-"`)
- ✅ 상세에서 합격/불합격 분기 상태 변경 — `STATUS_BRANCH` + `StatusChangeModal`

### 3.3.4 개인정보 처리

- ⬜ 합격 발표 후 6개월 자동 파기 스케줄러 (Cron)
- ⬜ 개인정보 필드 null 처리 또는 레코드 삭제 로직
- ⬜ 감사 로그 / 관리자 알림 (필요 시)

### 3.3.5 면접 슬롯 관리 (`/interview-slots`)

- ✅ 별도 사이드바 라우트 `/interview-slots` — `apps/admin/src/pages/interview-slots/`
- ✅ 기수 + 파트 필터 (`InterviewSlotsToolbar`) — 파트는 "전체" 또는 단일 선택
- ✅ 슬롯 테이블 (`InterviewSlotsTable`) — 날짜/시간/파트/예약-정원/장소/액션
- ✅ 슬롯 등록·수정 통합 Drawer (`InterviewSlotRegisterDrawer`) — RHF + Zod
  - DatePicker 1개 + 시작/종료 TimeField 2개 (같은 날짜 시작·종료)
  - capacity / location / description
  - 수정 모드 시 cohortId/cohortPartId Select 는 isReadOnly + 안내 caption (BE PATCH DTO 가 두 필드를 미지원)
- ✅ 슬롯 삭제 Dialog (`DeleteInterviewSlotDialog`) — `DeleteCohortDialog` 패턴 미러링
- ✅ 흐름 훅 — `pages/interview-slots/hooks/useCreateOrUpdateSlotFlow` + `useDeleteSlotFlow` + `serialize`
- ✅ Phase B — `StatusChangeModal` 의 `INTERVIEW_SLOTS_NOT_READY` 분기에서 `InterviewSlotsRequiredModal` (HeroUI Modal) 노출 → "슬롯 등록하러 가기" 시 `/interview-slots?cohortId=X&cohortPartId=Y` 로 navigate (필터 prefill)
- ✅ 예약자 목록 표시 — 슬롯 행 "예약/정원" 셀 클릭 → `ReservationsDrawer` 오픈 (`InterviewSlotResponseDto.reservations` nested 활용). 지원자명은 `applicationQueries.getAdminApplications({ cohortId })` `useSuspenseQuery` 로 `applicationFormId → applicantName` 매핑
- ✅ 예약 취소 어드민 UI — `CancelReservationDialog` (AlertDialog) + `useCancelReservationFlow` (`cancelInterviewReservation` mutation → toast + `slotLists()` invalidate). Drawer 안 예약 행 [취소] 버튼에서 confirm 후 호출
- ✅ 슬롯 반복 등록 — 등록 Drawer 의 "여러 개 생성" 모드. 운영 시간대 + 슬롯 길이(30/60분 프리셋·직접 입력)로 후보를 생성해 체크리스트 미리보기(`BulkSlotCandidateList`) → 단건 POST 병렬 호출(`useCreateSlotsBulkFlow`, BE bulk API 없음). 같은 기수·파트 기존 슬롯과 겹치는 후보는 `useBulkSlotCandidates` 가 잠가 등록 불가. 부분 실패 시 Drawer 유지 + 실패분만 재전송. 순수 로직(`generateSlotCandidates`·`markConflictingCandidates`·직렬화·스키마)은 vitest 단위 테스트. 다중 날짜 그리드는 후속
- ✅ 지원자 테이블 면접일자 컬럼 — `useApplicationsBoard` 가 `getInterviewSlots` 응답의 `reservations[].applicationFormId → slot.startAt` 로 Map 빌드해 `ApplicationTable` 에 전달 (commit 197834b)

---

## 3.4 프로젝트 DB 관리 (`/projects`)

> 화면 레퍼런스: HTML 목업 `#page-projects` 영역. 컬럼/필터/Drawer 구성은 HTML을 따르되 `status` 필드는 백엔드 DTO에 없으므로 제거한다. 세부 계획은 [설계 문서](./docs/superpowers/specs/2026-04-26-blog-projects-admin-design.md) 참조.

- ✅ 목록 조회 (썸네일 / 서비스명 / 플랫폼 / 기수 / 한줄설명 / 참여자수) — `useInfiniteProjects` 연동
- ✅ 플랫폼 필터 (서버) + 기수 필터 (클라이언트, `useCohorts` 매핑) + 서비스명 검색
- ✅ "더 보기" 페이지네이션 (cursor 기반, `useInfiniteQuery`)
- ✅ 새 프로젝트 등록/수정 Drawer (`ProjectFormDrawer.tsx`) — 썸네일 · 플랫폼 다중 · 서비스명 · 한줄설명 · 기수 · 참여자 N명, react-hook-form + Zod
- ✅ 썸네일 이미지 업로드 (`useUploadFile({ category: 'project-thumbnail' })`)
- ✅ 참여자 입력 (`useFieldArray` — 이름/파트/후기)
- ✅ 삭제 확인 (`DeleteProjectDialog` — HeroUI `AlertDialog`) + `useDeleteProject`
- ✅ 저장/삭제 토스트 (HeroUI v3 `toast`, [`docs/admin-toast.md`](./docs/admin-toast.md) 표준)
- ⬜ PDF 업로드 (`useUploadFile({ category: 'project-pdf' })`) — 후속 스코프
- ⬜ 등록 시 `/projects/[id]` URL 자동 생성 (웹 연동) — 후속 스코프
- ⬜ 브라우저 회귀 테스트 (실제 백엔드/MSW 연동 후)

---

## 3.5 블로그 DB 관리 (`/blog-posts`)

> 화면 레퍼런스: HTML 목업 `#page-blog` 영역. 백엔드 DTO에 없는 `status` / `author` / `category` 필드는 제거한다. 세부 계획은 [설계 문서](./docs/superpowers/specs/2026-04-26-blog-projects-admin-design.md) 참조.

- ✅ 목록 조회 (썸네일 / 제목 / 본문일부 / 외부 링크 / 등록일) — `useInfiniteBlogPosts` 연동
- ✅ 제목 검색 (클라이언트, 부분 일치)
- ✅ "더 보기" 페이지네이션 (cursor 기반, `useInfiniteQuery`)
- ✅ 새 블로그 등록/수정 Drawer (`BlogPostFormDrawer.tsx`) — 썸네일 · 제목 · 본문일부 · 외부 URL, react-hook-form + Zod
- ✅ 썸네일 이미지 업로드 (`useUploadFile({ category: 'blog-thumbnail' })`)
- ✅ 삭제 확인 (`DeleteBlogPostDialog` — HeroUI `AlertDialog`) + `useDeleteBlogPost`
- ✅ 저장/삭제 토스트 (HeroUI v3 `toast`, [`docs/admin-toast.md`](./docs/admin-toast.md) 표준)
- ⬜ 등록 시 `/blog/[id]` URL 자동 생성 (웹 연동) — 후속 스코프
- ⬜ 브라우저 회귀 테스트 (실제 백엔드/MSW 연동 후)

---

## 3.6 FAQ 관리

- ✅ MVP: 프론트엔드 하드코딩 (어드민 구현 제외 결정)
- ⬜ Phase 2: 어드민 Q&A 등록/수정/삭제, 표시 순서 드래그 정렬

---

## 5. 데이터 모델 (참조)

백엔드 스키마이지만 프론트 타입 반영 여부 추적 목적.

- ✅ `cohort` ENUM — `CreateCohortRequestDtoStatus`, `CohortStatus`, `CohortPartConfigDtoName` 사용 중
- ✅ `project.platform` ENUM[] — `ProjectPlatform` 타입 사용 중
- ✅ `early_notification` — `EarlyNotificationDto` 사용 중
- 🔧 `applicant` — `ApplicationDto` 사용 중. 개인정보 필드(privacy_agreed_at, delete_scheduled_at 등) 상세 페이지 미구현으로 미검증
- ✅ `pages/semesters/types.d.ts` 의 `SemesterRegisterForm` / `CohortPartFormState` 는 폼 입력 전용 (UI state). `serialize.ts` 가 DTO(`CohortPartConfigDto` 등) 와 매핑 — 의도된 분리, 중복 아님

---

## 6. MVP 범위 요약

### 6.1 MVP 포함 — 진행 상황

| 영역 | 상태 | 비고 |
| --- | --- | --- |
| 홈페이지 — 홈 (소개/CTA/수치/미리보기/후원사/FAQ/지원 유도) | ⬜ | `apps/web` 스켈레톤 |
| 홈페이지 — 모집 안내 (파트/프로세스/커리큘럼/지원 신청) | ⬜ | |
| 홈페이지 — 지원 (사전 알림 / 지원서 + 개인정보 동의) | ⬜ | |
| 홈페이지 — 프로젝트 (목록+필터 / 상세 / PDF) | ⬜ | `project/[id]` 라우트만 존재 |
| 홈페이지 — 블로그 (외부 아티클 링크 목록) | ⬜ | |
| 어드민 — 기수 관리 (상태 + 수동 변경) | ✅ | 목록/통계/등록/수정/상태변경/파트양식 저장 완료. 부분 실패 시 edit 모드 자동 전환 |
| 어드민 — 지원자 목록/상세/상태 변경 | ✅ | 목록·Drawer 상세·합격불합격 분기·면접일자 컬럼·개인정보 동의 일자 표시 완료 |
| 어드민 — 사전 알림 DB + 수동 이메일 발송 | 🔧 | 목록/통계/일괄발송/CSV/캠페인(예약 발송 관리) 완료. 개별발송(백엔드 엔드포인트 없음) 대기 중 |
| 어드민 — 프로젝트 DB 등록/수정 | ✅ | 목록·필터·등록·수정·삭제 코드 완료 (브라우저 검증 미실시) |
| 어드민 — 블로그 DB 등록/수정 | ✅ | 목록·검색·등록·수정·삭제 코드 완료 (브라우저 검증 미실시) |

### 6.2 Phase 2

- ⬜ 프로젝트 참여자 후기
- ⬜ 블로그 아티클 내부 페이지화
- ⬜ 어드민 FAQ 관리

---

## 정밀 갭 (코드 라인 참조, 2026-05-04 추가)

HTML 목업 대비 현재 코드의 **하드코딩 / API 미연동 / 미구현 인터랙션** 을 file:line 단위로 정리. 작업 우선순위는 ▲ 표시.

### packages/api 레이어 갭

> 241ae4e 이전에 남아있던 "generated 미사용 / 패턴 불일치" 갭(cohort·auth·storage)은 openapi-fetch 마이그레이션으로 일괄 해소됨. 모든 도메인이 `api.get/post/...` 패턴으로 통일.

| 도메인 | 문제 | 영향 |
|---|---|---|
| **storage** | `listFiles`·`deleteFile`·`createSignedUrl`·`downloadFile` queries 미구현 (BE 엔드포인트 추가 후 진행) | 파일 관리 기능 확장 불가 |
| ~~**cohort**~~ | ✅ 241ae4e 이후 `api` 싱글톤 사용 — 다른 도메인과 패턴 일치 | 갭 해소 |
| ~~**auth**~~ | ✅ 241ae4e 이후 `api` 싱글톤 사용 — 다른 도메인과 패턴 일치 | 갭 해소 |
| ~~**notification-campaign**~~ | ✅ SDK + 어드민 UI(`NotificationCampaignSection` / 편집 Drawer / pause·resume 토글) 연결 완료 | 갭 해소 |
| ~~**interview**~~ | ✅ `cancelInterviewReservation` mutation + 어드민 UI(`ReservationsDrawer` / `CancelReservationDialog`) 연결 완료 | 갭 해소 |
| ~~**early-notification**~~ | ✅ `subscribeGeneralEarlyNotification` (POST /api/v1/early-notifications/general) SDK·queries 추가, `apps/web/lib/api/early-notification.ts` 에서 활성 기수 없을 때 자동 폴백 | 갭 해소 |
| ~~**cohort (public)**~~ | ✅ `getCohortPart` (GET /api/v1/cohorts/parts/{id}) SDK·queries 추가 | 갭 해소 |
| ~~**legacy `webApi` 단일 객체**~~ | ✅ `packages/api/src/web.ts` 폐기. `apps/web/lib/api/{project,blog,cohort,application,early-notification}.ts` 도메인별 파일 + `lib/mappers/*` 매퍼 분리로 정리 | 갭 해소 |


### HTML 목업에는 있는데 미구현인 UI

- `apps/admin/src/pages/early-notification/components/EarlyNotificationTable.tsx` — 개별 발송 액션 컬럼 자체 부재. 단건 발송 엔드포인트가 BE generated에 없어 구현 대기

### 회귀 테스트

- ⬜ `/projects` — 실제 백엔드 또는 MSW 연동 후 등록·수정·삭제·필터·"더 보기" 시나리오 브라우저 검증
- ⬜ `/blog-posts` — 동일

### 우선순위 Top 3 (가장 빠르게 가치 회수)

1. ~~`useUpdateCohortParts` 연결~~ — ✅ 처리됨 (`useCreateOrUpdateCohortFlow` 안에 `updateCohortParts` mutation 추가, 부분 실패는 `PartsSaveAfterCreateError` throw → 호출부 instanceof 분기. 흐름 훅에서 토스트/콜백 제거하고 호출부 onSubmit 으로 이관)
2. ~~`StatusChangeModal` `INTERVIEW_SLOTS_NOT_READY` 에러 분기~~ — ✅ 처리됨 (`ApiError.is("INTERVIEW_SLOTS_NOT_READY")` 분기 + 강조 토스트, 모달 유지)
3. ~~`개인정보 동의 일자` 표시~~ — ✅ 처리됨 (`ApplicationDetailDrawer` 에 `동의 일자` `InfoRow` 추가, BE 미응답 시 `"-"` 폴백)
