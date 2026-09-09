import { useState } from "react"
import { Drawer, ToggleButton, ToggleButtonGroup } from "@heroui/react"

import { useIsMobile } from "@/shared/hooks/useIsMobile"

import type { InterviewSlotForm } from "../types"
import { InterviewSlotBulkForm } from "./InterviewSlotBulkForm"
import { InterviewSlotSingleForm } from "./InterviewSlotSingleForm"

export type DrawerMode = "create" | "edit"

type RegisterKind = "single" | "bulk"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: DrawerMode
  targetId: number | null
  prefill?: Partial<InterviewSlotForm>
}

const TITLE_BY_MODE: Record<DrawerMode, string> = {
  create: "면접 슬롯 등록",
  edit: "면접 슬롯 수정",
}

const REGISTER_KIND_LABEL: Record<RegisterKind, string> = {
  single: "1개 등록",
  bulk: "여러 개 생성",
}

/**
 * 슬롯 등록/수정 Drawer 셸. 등록 모드에서만 "1개 / 여러 개" 전환을 제공하고,
 * 실제 폼(Body + Footer)은 각 폼 컴포넌트가 그린다. Drawer 가 닫히면 폼은 언마운트된다.
 */
export function InterviewSlotRegisterDrawer({
  isOpen,
  onOpenChange,
  mode,
  targetId,
  prefill,
}: Props) {
  const isMobile = useIsMobile()
  const [registerKind, setRegisterKind] = useState<RegisterKind>("single")
  const isEdit = mode === "edit"

  function handleOpenChange(open: boolean) {
    onOpenChange(open)
    if (!open) setRegisterKind("single")
  }

  function handleRegisterKindChange(keys: Set<React.Key>) {
    const [key] = keys
    if (key === "single" || key === "bulk") setRegisterKind(key)
  }

  const shouldRenderBulk = !isEdit && registerKind === "bulk"

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog
          className={!isMobile ? "w-full max-w-120 bg-background" : ""}
        >
          <Drawer.Header className="space-y-3">
            <Drawer.Heading className="text-lg font-semibold">
              {TITLE_BY_MODE[mode]}
            </Drawer.Heading>
            {!isEdit && (
              <ToggleButtonGroup
                aria-label="등록 방식"
                selectionMode="single"
                disallowEmptySelection
                fullWidth
                size="sm"
                selectedKeys={[registerKind]}
                onSelectionChange={handleRegisterKindChange}
              >
                {(Object.keys(REGISTER_KIND_LABEL) as RegisterKind[]).map(
                  (kind) => (
                    <ToggleButton key={kind} id={kind}>
                      {REGISTER_KIND_LABEL[kind]}
                    </ToggleButton>
                  )
                )}
              </ToggleButtonGroup>
            )}
          </Drawer.Header>

          {shouldRenderBulk ? (
            <InterviewSlotBulkForm
              prefill={{
                cohortId: prefill?.cohortId,
                cohortPartId: prefill?.cohortPartId,
                cohortPartName: prefill?.cohortPartName,
              }}
              onDone={() => handleOpenChange(false)}
            />
          ) : (
            <InterviewSlotSingleForm
              mode={mode}
              targetId={targetId}
              prefill={prefill}
              onDone={() => handleOpenChange(false)}
            />
          )}
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
