import { Checkbox, Chip } from "@heroui/react"

import type { MarkedSlotCandidate } from "../lib/markConflictingCandidates"

interface Props {
  candidates: MarkedSlotCandidate[]
  excludedStartTimes: string[]
  selectedCount: number
  onToggle: (startTime: string, isSelected: boolean) => void
}

/**
 * 반복 등록 미리보기. 기존 슬롯과 겹치는 후보는 체크할 수 없게 잠가 등록을 막는다.
 */
export function BulkSlotCandidateList({
  candidates,
  excludedStartTimes,
  selectedCount,
  onToggle,
}: Props) {
  if (candidates.length === 0) {
    return (
      <p className="text-foreground-secondary rounded-lg border border-dashed p-4 text-center text-xs">
        운영 시간대와 슬롯 길이를 입력하면 생성될 슬롯이 여기에 표시됩니다.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-foreground-secondary text-xs">
        총 {candidates.length}개 중 {selectedCount}개 등록
      </p>
      <ul className="max-h-60 space-y-1 overflow-y-auto rounded-lg border p-2">
        {candidates.map((candidate) => {
          const isSelected =
            !candidate.isConflicting &&
            !excludedStartTimes.includes(candidate.startTime)
          return (
            <li
              key={candidate.startTime}
              className="flex items-center justify-between gap-2 px-1"
            >
              <Checkbox
                aria-label={`${candidate.startTime} ~ ${candidate.endTime}`}
                isSelected={isSelected}
                isDisabled={candidate.isConflicting}
                onChange={(selected) => onToggle(candidate.startTime, selected)}
              >
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <span className="text-sm tabular-nums">
                    {candidate.startTime} ~ {candidate.endTime}
                  </span>
                </Checkbox.Content>
              </Checkbox>
              {candidate.isConflicting && (
                <Chip size="sm" color="warning" variant="soft">
                  이미 등록됨
                </Chip>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
