import { ApiError, ErrorMessage } from "@ddd/api"
import type { FileUploadConstraint } from "@ddd/api"

const MEGABYTE = 1024 * 1024

export const toMegabytes = (bytes: number): number => bytes / MEGABYTE

/** 업로드 전 사전 차단. 통과하면 null, 막히면 사용자에게 보여줄 사유. */
export const findUploadRejection = (
  file: File,
  constraint: FileUploadConstraint,
): string | null => {
  if (!constraint.allowedMimeTypes.includes(file.type)) {
    return `허용되지 않는 파일 형식입니다. (${constraint.allowedMimeTypes.join(", ")})`
  }
  if (file.size > constraint.maxBytes) {
    return `파일 용량은 최대 ${toMegabytes(constraint.maxBytes)}MB 입니다.`
  }
  return null
}

/** 장애 신고 시 원인 구분이 가능하도록 BE 에러 code 를 메시지에 함께 노출한다. */
export const describeUploadError = (error: unknown): string => {
  if (error instanceof ApiError) return `${error.message} (${error.code})`
  if (error instanceof Error) return error.message
  return ErrorMessage.UNKNOWN_ERROR
}

export const toAcceptAttribute = (constraint: FileUploadConstraint): string =>
  constraint.allowedMimeTypes.join(",")
