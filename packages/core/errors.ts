export const ERRORS = {
  // Common
  UNAUTHORIZED: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." },
  FORBIDDEN: { code: "FORBIDDEN", message: "접근 권한이 없습니다." },
  INVALID_INPUT: { code: "INVALID_INPUT", message: "잘못된 입력값입니다." },
  INTERNAL_SERVER_ERROR: { code: "INTERNAL_SERVER_ERROR", message: "서버 내부 오류가 발생했습니다." },

  // Application
  APPLICATION_NOT_FOUND: { code: "APPLICATION_NOT_FOUND", message: "존재하지 않는 지원서입니다." },
  ALREADY_PASSED: { code: "ALREADY_PASSED", message: "이미 합격 처리된 지원자입니다." },
  ALREADY_FAILED: { code: "ALREADY_FAILED", message: "이미 불합격 처리된 지원자입니다." },
  INVALID_STATUS_TRANSITION: { code: "INVALID_STATUS_TRANSITION", message: "유효하지 않은 상태 변경입니다." },

  // Member
  MEMBER_NOT_FOUND: { code: "MEMBER_NOT_FOUND", message: "존재하지 않는 회원입니다." },
  ALREADY_INACTIVE: { code: "ALREADY_INACTIVE", message: "이미 활동이 종료된 회원입니다." },

  // Admin
  ADMIN_NOT_FOUND: { code: "ADMIN_NOT_FOUND", message: "존재하지 않는 운영진입니다." },

  // Interview
  INTERVIEW_NOT_FOUND: { code: "INTERVIEW_NOT_FOUND", message: "존재하지 않는 면접입니다." },
  INTERVIEW_ALREADY_EXISTS: { code: "INTERVIEW_ALREADY_EXISTS", message: "이미 면접 일정이 등록되어 있습니다." },

  // Notice
  NOTICE_NOT_FOUND: { code: "NOTICE_NOT_FOUND", message: "존재하지 않는 공지사항입니다." },
  ALREADY_PUBLISHED: { code: "ALREADY_PUBLISHED", message: "이미 발행된 공지사항입니다." },
} as const;

export type ErrorCode = keyof typeof ERRORS;

export class AppError extends Error {
  public code: ErrorCode;

  constructor(error: { code: ErrorCode; message: string }) {
    super(error.message);
    this.code = error.code;
    this.name = "AppError";
  }
}

