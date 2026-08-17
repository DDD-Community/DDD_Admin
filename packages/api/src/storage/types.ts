import type { paths } from "../generated/api";

// POST /api/v1/admin/files/upload - 파일 업로드
export type PostUploadFileParams =
  paths["/api/v1/admin/files/upload"]["post"]["parameters"]["query"];
export type PostUploadFileResponse = FileUploadDto;

// 카테고리 (OpenAPI 스펙의 query enum 으로부터 추출)
export type FileUploadCategory = PostUploadFileParams["category"];

// 엔티티 타입 (BE 응답 schema 미정의 → 수동 정의)
export interface FileUploadDto {
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface FileUploadConstraint {
  allowedMimeTypes: readonly string[];
  maxBytes: number;
}
