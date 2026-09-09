/** 파트 필터에서 "전체" 를 의미하는 sentinel */
export const ALL_PARTS = "all" as const

export type PartFilterValue = number | typeof ALL_PARTS

/** 반복 등록 시 슬롯 길이 프리셋(분). 그 외는 "직접 입력" */
export const SLOT_DURATION_PRESETS = [30, 60] as const

export const MIN_SLOT_DURATION_MINUTES = 5
/** 8시간. 그 이상은 입력 실수로 본다 */
export const MAX_SLOT_DURATION_MINUTES = 480

/** 한 번에 등록 가능한 최대 슬롯 수. 5분 × 4시간 = 48 이 현실적 상한 */
export const MAX_BULK_SLOT_COUNT = 48
