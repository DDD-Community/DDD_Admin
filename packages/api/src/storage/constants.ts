import type { FileUploadCategory, FileUploadConstraint } from "./types";

const MEGABYTE = 1024 * 1024;
const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** BE 가 요구하는 multipart 필드명. 이 이름이 아니면 400 FILE_NOT_PROVIDED. */
export const FILE_UPLOAD_FIELD_NAME = "file";

/** category 별 BE 검증 규칙. 업로드 전 클라이언트 사전 차단에 사용한다. */
export const FILE_UPLOAD_CONSTRAINTS: Record<
  FileUploadCategory,
  FileUploadConstraint
> = {
  "project-pdf": {
    allowedMimeTypes: ["application/pdf"],
    maxBytes: 20 * MEGABYTE,
  },
  "project-thumbnail": {
    allowedMimeTypes: IMAGE_MIME_TYPES,
    maxBytes: 5 * MEGABYTE,
  },
  "blog-thumbnail": {
    allowedMimeTypes: IMAGE_MIME_TYPES,
    maxBytes: 5 * MEGABYTE,
  },
};
