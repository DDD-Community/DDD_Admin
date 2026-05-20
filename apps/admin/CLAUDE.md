# apps/admin — 어드민 앱 개발 가이드

DDD 동아리 운영진용 어드민 페이지. Vite + React 19, Tailwind CSS 4, React Router(Data Mode), HeroUI v3 기반.

---

## 주요 기술 결정

- **라우터**: React Router Data Mode (`createBrowserRouter`) — loader로 페이지 진입 전 데이터 페칭
- **스타일링**: Tailwind CSS 4 + `cn()` 유틸
- **UI 라이브러리**: `@heroui/react` v3 (React Aria Components 기반)
- **아이콘**: `@hugeicons/react`
- **API**: `@ddd/api` 패키지에서 import, `main.tsx`에서 `configureApi()` 초기화

---

## 참조 문서

| 문서                                                                         | 내용                                                              |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **[docs/admin-architecture.md](../../docs/admin-architecture.md)**           | FSD 디렉터리 구조, 레이어 규칙, 훅 위치 결정, 새 페이지 추가 방법 |
| **[docs/hero-ui.txt](../../docs/hero-ui.txt)**                               | HeroUI v3 컴포넌트 API (UI 작업 시 단일 출처)                     |
| **[docs/admin-toast.md](../../docs/admin-toast.md)**                         | 토스트(`toast.success/error/info/warning`) 표준 패턴              |
| **[docs/admin-auth.md](../../docs/admin-auth.md)**                           | 인증·세션·보호 라우트·API 클라이언트 계약                         |
| **[docs/admin-overlay-placement.md](../../docs/admin-overlay-placement.md)** | RAC collection 트리 안에서 오버레이 배치 규칙                     |
| **[progress.md](../../progress.md)**                                         | 기능 명세 대비 구현 체크리스트                                    |
