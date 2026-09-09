# DDD 프론트엔드 모노레포

IT 사이드 프로젝트 동아리(DDD) 운영을 위한 프론트엔드 모노레포.

> **세션 복기**
>
> 세션 시작 시 `.claude/handoff.md` 파일이 존재하면:
> 1. 파일을 즉시 읽는다.
> 2. 이전 세션 작업 내용을 한 문단으로 브리핑한다.
> 3. 파일을 삭제한다 (`Bash: rm .claude/handoff.md`).

> **코드 작성·수정·리뷰 전 절차**
>
> - **범용 React/TypeScript 컨벤션**(선언 스타일·네이밍·조건문·타입·스타일링·테스트)은 `seokit-frontend:seokit-rules` 스킬이 단일 출처다. `.tsx`/`.ts` 작업 시 자동 로드된다.
> - **이 모노레포 고유 구조 규약**은 **[CODE_RULES.md](./CODE_RULES.md)** 를 기준으로 한다. 새 모듈/훅 추가 시 위치 결정에 직결되므로 반드시 확인한다.
>   1. `§1 프로젝트 구조` — 패키지 의존성 + apps/admin 2단 구조(`pages → shared`, `pages → packages/api`). 페이지 전용 코드는 `pages/{page}/` 콜로케이션, 2개 이상 페이지 공용만 `shared/`. barrel·서브폴더 금지.
>   2. `§2 커스텀 훅 위치 & 데이터 접근` — 훅 위치 분류 (쿼리/뮤테이션 팩토리 = `packages/api`, 페이지 전용 훅 = `pages/{page}/hooks/`, 크로스 페이지 훅 = `shared/hooks/`) + wrapper hook 금지 패턴.
> - 작업이 위 규칙을 위반하지 않는지 확인하고, 위반이 발견되면 그 자리에서 수정하거나 사용자와 합의 후 진행한다.
> - PR 직전 CODE_RULES.md `§3 PR 체크리스트` 를 다시 한 번 검토한다.

---

## 목적

- `apps/admin` — 동아리 운영진용 어드민 페이지 (현재 개발 중)
- `apps/web` — 홈/블로그/프로젝트/모집안내 랜딩페이지 (개발 중)
- `packages/api` — 공통 API 클라이언트 SDK 및 타입 (`openapi-typescript` 로 BE OpenAPI → 타입 생성, 런타임은 `openapi-fetch` 기반 `api` 싱글톤)

> 기능 명세 대비 구현 체크리스트는 **[progress.md](./progress.md)** 를 참조한다.
>
> 어드민 기획 명세 + 백/프론트 구현 현황은 **[docs/admin-implementation-status.md](./docs/admin-implementation-status.md)** 를 참조한다. `/progress` 커맨드를 실행하면 이 문서와 `progress.md`, 핵심 코드 파일을 교차 분석하여 영역별 완료율 + 다음 작업 Top 3를 리포트한다.
>
> admin 프로젝트의 UI 컴포넌트를 생성 / 수정 / 삭제하는 작업 전에는 **[docs/admin-heroui.md](./docs/admin-heroui.md)** (사용 규약·배치 기준·금지 패턴) 와 **[docs/hero-ui.txt](./docs/hero-ui.txt)** (컴포넌트 props·slots 단일 출처) 를 먼저 참조한다.
>
> 기수(cohort)의 **파트별 지원서 양식(`formSchema` / `parts`)** 또는 `cohort.applicationForm` 관련 작업 전에는 **[docs/admin-cohort-parts-policy.md](./docs/admin-cohort-parts-policy.md)** 를 먼저 검토한다. (`applicationForm` 는 dead 필드이며, 단일 source 는 `PUT /admin/cohorts/{id}/parts`)

백엔드는 별도 레포지토리에서 관리. 이 레포는 프론트엔드 전용.

---

## 모노레포 구조

```
(root)
├── apps/
│   ├── admin/        (@ddd/admin) — Vite + React, Tailwind CSS
│   └── web/          (@ddd/web)   — Next.js App Router
└── packages/
    ├── api/          (@ddd/api)   — API 클라이언트, 타입 (openapi-typescript 생성 + openapi-fetch 런타임)
    └── ui/           (@ddd/ui)    — admin/web 공통 UI 컴포넌트 (예정)
```

**패키지 매니저**: PNPM Workspaces
**Node.js**: >= 20

### 앱별 기술 스택

| 앱             | 프레임워크              | 스타일링       | 상태    | 비고                              |
| -------------- | ----------------------- | -------------- | ------- | --------------------------------- |
| `apps/admin`   | Vite + React 19         | Tailwind CSS 4 | 개발 중 | HeroUI v3, React Router Data Mode |
| `apps/web`     | Next.js 16 (App Router) | -              | 개발 중 | 홈/블로그/프로젝트/모집안내       |
| `packages/api` | -                       | -              | 개발 중 | openapi-typescript + openapi-fetch, TanStack Query |

---

## 스크립트

```bash
# 루트에서 실행
pnpm dev:admin          # 어드민 개발 서버
pnpm build:admin        # 어드민 빌드

pnpm dev:web            # 웹 개발 서버 (추후)
pnpm build:web          # 웹 빌드 (추후)

pnpm gen:api            # openapi-typescript 로 BE OpenAPI → packages/api/src/generated/api.ts 갱신

pnpm --filter @ddd/admin test   # 어드민 단위 테스트 (vitest, 순수 로직 대상)

pnpm lint               # 전체 린트
pnpm lint:fix           # 전체 린트 자동 수정
pnpm format             # 전체 Prettier 포맷

# 패키지 필터
pnpm --filter @ddd/admin dev
pnpm --filter @ddd/web dev
pnpm --filter @ddd/api generate
```

---

## apps/web 라우트 구조

현재는 App Router 스켈레톤만 구성되어 있다. `components/`, `hooks/` 폴더는 아직 없으며 UI/섹션 작업이 시작되면 추가한다.

```
apps/web/
└── app/
    ├── layout.tsx                  # 루트 레이아웃
    ├── page.tsx                    # / 홈
    ├── globals.css
    ├── blog/
    │   └── page.tsx                # /blog
    ├── project/
    │   ├── page.tsx                # /project 목록
    │   └── [id]/
    │       └── page.tsx            # /project/{id} 상세 풀 페이지
    └── recruit/
        └── page.tsx                # /recruit 모집안내
```

### 페이지별 메타데이터

| 경로            | title                                             | description                                                                                                  |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `/`             | DDD - 사이드 프로젝트로 성장하는 개발자 커뮤니티  | 개발자, 디자이너, 기획자가 함께 사이드 프로젝트를 만들고 성장하는 커뮤니티 DDD. 실전 협업 경험을 쌓아보세요. |
| `/blog`         | DDD 블로그 - 사이드 프로젝트 인사이트 \| DDD      | DDD 멤버들의 사이드 프로젝트 경험과 개발, 협업 인사이트를 공유합니다.                                        |
| `/project`      | DDD 프로젝트 - 사이드 프로젝트 결과물 모음 \| DDD | DDD에서 진행된 다양한 사이드 프로젝트 결과물을 확인해보세요.                                                 |
| `/project/[id]` | {프로젝트명} \| DDD                               | DDD에서 진행된 사이드 프로젝트 {프로젝트명} 직접 확인해보세요.                                               |
| `/recruit`      | DDD 모집 - 사이드 프로젝트 멤버 지원 \| DDD       | DDD에서 함께할 개발자, 디자이너, 기획자를 모집합니다.                                                        |
