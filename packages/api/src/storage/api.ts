import { api } from "../fetchClient";
import { FILE_UPLOAD_FIELD_NAME } from "./constants";
import type { FileUploadDto, PostUploadFileParams } from "./types";

/**
 * 파일 업로드 - POST /api/v1/admin/files/upload
 *
 * BE OpenAPI 의 `storage_uploadFile` 에 requestBody(multipart) 와 201 응답 schema 가
 * 선언되어 있지 않아 타입 캐스트가 필요하다. BE spec 보강 시 캐스트 제거.
 *
 * FormData 는 호출부가 아니라 여기서 조립한다 — 필드명(`file`)과
 * "Content-Type 을 직접 지정하지 않는다"(boundary 유실 방지)는 계약을 한 곳에서 보장하기 위함.
 */
export const storageApi = {
  uploadFile: ({
    params,
    file,
  }: {
    params: PostUploadFileParams;
    file: File;
  }): Promise<FileUploadDto> => {
    const payload = new FormData();
    payload.append(FILE_UPLOAD_FIELD_NAME, file);

    return api.post("/api/v1/admin/files/upload", {
      params: { query: { category: params.category } },
      body: payload,
    } as never) as unknown as Promise<FileUploadDto>;
  },
};
