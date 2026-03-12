export const ERROR_CODE = {
  // Common
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_INPUT: "INVALID_INPUT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",

  // Application
  APPLICATION_NOT_FOUND: "APPLICATION_NOT_FOUND",
  ALREADY_PASSED: "ALREADY_PASSED",
  ALREADY_FAILED: "ALREADY_FAILED",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",

  // Member
  MEMBER_NOT_FOUND: "MEMBER_NOT_FOUND",
  ALREADY_INACTIVE: "ALREADY_INACTIVE",

  // Admin
  ADMIN_NOT_FOUND: "ADMIN_NOT_FOUND",
} as const;

export type ErrorCodeKey = keyof typeof ERROR_CODE;
export type ErrorCode = (typeof ERROR_CODE)[ErrorCodeKey];

export const ERROR_MESSAGE: Record<ErrorCode, string> = {
  // Common
  [ERROR_CODE.UNAUTHORIZED]: "로그인이 필요합니다.",
  [ERROR_CODE.FORBIDDEN]: "접근 권한이 없습니다.",
  [ERROR_CODE.INVALID_INPUT]: "잘못된 입력값입니다.",
  [ERROR_CODE.INTERNAL_SERVER_ERROR]: "서버 내부 오류가 발생했습니다.",

  // Application
  [ERROR_CODE.APPLICATION_NOT_FOUND]: "존재하지 않는 지원서입니다.",
  [ERROR_CODE.ALREADY_PASSED]: "이미 합격 처리된 지원자입니다.",
  [ERROR_CODE.ALREADY_FAILED]: "이미 불합격 처리된 지원자입니다.",
  [ERROR_CODE.INVALID_STATUS_TRANSITION]: "유효하지 않은 상태 변경입니다.",

  // Member
  [ERROR_CODE.MEMBER_NOT_FOUND]: "존재하지 않는 회원입니다.",
  [ERROR_CODE.ALREADY_INACTIVE]: "이미 활동이 종료된 회원입니다.",

  // Admin
  [ERROR_CODE.ADMIN_NOT_FOUND]: "존재하지 않는 운영진입니다.",
};
