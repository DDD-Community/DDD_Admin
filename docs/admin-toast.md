# 어드민 토스트 사용 가이드

`apps/admin`에서 사용자에게 짧은 알림을 보낼 때는 **HeroUI v3의 `toast` API**를 단일 진입점으로 사용한다.
별도의 토스트 라이브러리(`sonner`, `react-hot-toast` 등)는 도입하지 않는다.

---

## 1. 전역 Provider — 이미 마운트되어 있음

`apps/admin/src/main.tsx`에 `<Toast.Provider />`가 한 번만 마운트되어 있다. 페이지/컴포넌트에서 추가 마운트는 불필요하다.

```tsx
// apps/admin/src/main.tsx
import { Toast } from "@heroui/react";

<QueryProvider>
  <Router />
  <Toast.Provider placement="top end" />
</QueryProvider>;
```

`placement`는 어드민 표준으로 `"top end"` (우측 상단)을 사용한다. 화면 단에서 변경하지 않는다.

---

## 2. 호출 패턴 — `import { toast } from "@heroui/react"`

`@heroui/react`에서 `toast` 함수 객체를 직접 import한다. (대문자 `Toast`는 컴포넌트, 소문자 `toast`는 명령형 호출용 함수다.)

```tsx
import { toast } from "@heroui/react";

toast.success("제목", { description: "보충 설명" });
toast.error("제목", { description: "에러 상세" });
toast.info("제목", { description: "정보 메시지" });
toast.warning("제목", { description: "주의 메시지" });
```

| 메서드          | 용도                                        |
| --------------- | ------------------------------------------- |
| `toast.success` | 저장/생성/삭제 등 사용자 액션이 성공했을 때 |
| `toast.error`   | API 실패, 검증 실패, 네트워크 오류          |
| `toast.info`    | 단순 안내 (알림 발송 예정 등)               |
| `toast.warning` | 비파괴 경고 (저장 안 한 변경 등)            |

> 두 번째 인자(옵션 객체)의 `description` 외 다른 옵션이 필요하면 `docs/hero-ui.txt`의 Toast 항목 또는 HeroUI 공식 문서를 참조한다.

---

## 3. 어드민 표준 메시지 가이드

작업 결과를 짧게 요약하는 **제목**과, 어떤 일이 일어났는지 한 문장 더 보충하는 **description** 두 줄 구조를 기본으로 한다.

### 성공 메시지

| 상황      | title                         | description                                    |
| --------- | ----------------------------- | ---------------------------------------------- |
| 등록 성공 | `"프로젝트가 저장되었습니다"` | `"홈페이지에 노출됩니다."`                     |
| 수정 성공 | `"수정되었습니다"`            | (필요 시 무엇이 바뀌었는지)                    |
| 삭제 성공 | `"삭제되었습니다"`            | (필요 시 항목 식별자)                          |
| 일괄 작업 | `"전체 알림 발송 완료"`       | `\`신청자 ${total}명에게 알림을 보냈습니다.\`` |

### 실패 메시지

```tsx
toast.error("저장에 실패했습니다", {
  description: (error as Error).message ?? "잠시 후 다시 시도해 주세요.",
});
```

- 백엔드가 내려준 메시지를 우선 사용한다 (`(error as Error).message`).
- 메시지가 비어있는 경우에만 일반 fallback 문구를 사용한다.
- 민감한 내부 에러 코드/스택은 노출하지 않는다.

---

## 4. 정형 사용처 (모범 예시)

### 4.1 mutation 성공/실패 처리

```tsx
import { toast } from "@heroui/react";
import { useUpdateProject } from "@ddd/api";
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "@ddd/api";

const queryClient = useQueryClient();
const { mutateAsync, isPending } = useUpdateProject();

const handleSubmit = async (payload) => {
  try {
    await mutateAsync({ params: { id }, payload });
    queryClient.invalidateQueries({ queryKey: projectKeys.all });
    toast.success("프로젝트가 저장되었습니다", {
      description: "홈페이지에 노출됩니다.",
    });
    onClose();
  } catch (error) {
    toast.error("저장에 실패했습니다", {
      description: (error as Error).message,
    });
  }
};
```

### 4.2 일괄 액션 알림 (`EarlyNotificationContent` 패턴)

```tsx
const handleBulkSend = () => {
  // ... 발송 로직
  toast.success("전체 알림 발송 완료", {
    description: `신청자 ${total}명에게 알림을 보냈습니다.`,
  });
};
```

### 4.3 삭제 확인 (`AlertDialog` 흐름과 함께)

```tsx
const handleConfirmDelete = async () => {
  try {
    await mutateAsync({ params: { id } });
    queryClient.invalidateQueries({ queryKey: projectKeys.all });
    toast.success("삭제되었습니다");
    setOpen(false);
  } catch (error) {
    toast.error("삭제에 실패했습니다", {
      description: (error as Error).message,
    });
  }
};
```

---

## 5. 하지 말 것 (Anti-patterns)

- ❌ **중복 Provider 마운트** — 페이지마다 `<Toast.Provider />`를 또 두지 않는다.
- ❌ **`alert()` / `window.confirm()` 사용** — HeroUI `toast` + `AlertDialog` 조합으로 대체.
- ❌ **`react-hot-toast`, `sonner`, 자체 구현 등 추가 라이브러리** — 일관성 깨짐.
- ❌ **에러를 swallowing 후 success 토스트** — try/catch에서 catch 블록은 반드시 `toast.error`로 사용자에게 알림.
- ❌ **민감 정보가 담긴 raw error 메시지 그대로 노출** — 사용자 친화적 문구로 정제.

---

## 6. 변경 이력

- 2026-04-26: 초안 작성. 레퍼런스: `apps/admin/src/pages/early-notification/EarlyNotificationContent.tsx`
