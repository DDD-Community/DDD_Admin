export const ErrorMessage = {
  // 어드민 관련 에러 메시지
  INTERNAL_SERVER_ERROR: "서버 내부 오류가 발생했습니다.",
  UNAUTHORIZED: "인증이 필요합니다.",
  FORBIDDEN: "접근 권한이 없습니다.",
  NOT_FOUND: "요청한 리소스를 찾을 수 없습니다.",
  BAD_REQUEST: "잘못된 요청입니다.",

  USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",

  COHORT_NOT_FOUND: "기수를 찾을 수 없습니다.",

  APPLICATION_FORM_NOT_FOUND: "지원서를 찾을 수 없습니다.",

  EVALUATION_NOT_FOUND: "평가 정보를 찾을 수 없습니다.",

  INTERVIEW_SLOT_NOT_FOUND: "면접 슬롯을 찾을 수 없습니다.",
  INTERVIEW_SLOT_ALREADY_RESERVED: "이미 예약된 면접 슬롯입니다.",
  INTERVIEW_SLOTS_NOT_READY: "면접 슬롯이 준비되지 않았습니다.",

  FILE_NOT_PROVIDED: "업로드할 파일이 없습니다.",
  FILE_TYPE_NOT_ALLOWED: "허용되지 않는 파일 형식입니다.",
  FILE_SIZE_EXCEEDED: "파일 크기가 제한을 초과했습니다.",
  FILE_UPLOAD_FAILED: "파일 업로드에 실패했습니다.",
  STORAGE_NOT_CONFIGURED: "스토리지가 설정되지 않았습니다.",

  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
  // 추가적인 에러 메시지를 여기에 정의할 수 있습니다.
} as const;

export type ErrorMessageKey = keyof typeof ErrorMessage;

export class ApiError extends Error {
  readonly code: ErrorMessageKey;

  constructor(code: ErrorMessageKey, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
  // 타입 가드 메서드 강화
  is(code: ErrorMessageKey): this is ApiError & { code: typeof code } {
    return this.code === code;
  }
}
