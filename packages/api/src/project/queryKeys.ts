import type {
  GetProjectsParams,
  GetProjectParams,
  GetInfiniteProjectsParams,
  GetAdminProjectParams,
} from "./types";

export const projectKeys = {
  /** 프로젝트 base key */
  all: ["projects"] as const,

  /** 프로젝트 공개 목록 key */
  lists: () => [...projectKeys.all, "list"] as const,

  /**
   * 프로젝트 공개 목록 필터 key
   *
   * @param {GetProjectsParams} params - 조회 파라미터
   * @param {ProjectPlatform} [params.platform] - 플랫폼 필터 (선택)
   * @param {string} [params.cursor] - 다음 페이지 커서 (선택)
   * @param {number} [params.limit] - 페이지 크기 (선택)
   */
  list: (params: GetProjectsParams) =>
    [...projectKeys.lists(), params] as const,

  /** 프로젝트 무한 스크롤 목록 key */
  infiniteLists: () => [...projectKeys.all, "infinite-list"] as const,

  /**
   * 프로젝트 무한 스크롤 필터 key
   *
   * @param {GetInfiniteProjectsParams} params - 조회 파라미터 (cursor 제외)
   * @param {ProjectPlatform} [params.platform] - 플랫폼 필터 (선택)
   * @param {number} [params.limit] - 페이지 크기 (선택)
   */
  infiniteList: (params: GetInfiniteProjectsParams) =>
    [...projectKeys.infiniteLists(), params] as const,

  /**
   * 프로젝트 단일 key
   *
   * @param {GetProjectParams} params - 조회 파라미터
   * @param {number} params.id - 프로젝트 ID
   */
  detail: (params: GetProjectParams) =>
    [...projectKeys.all, "detail", params] as const,

  /** 어드민 프로젝트 전체 목록 key (엔드포인트에 파라미터·커서 없음) */
  adminLists: () => [...projectKeys.all, "admin-list"] as const,

  /** 어드민 프로젝트 단건 key */
  adminDetails: () => [...projectKeys.all, "admin-detail"] as const,

  /**
   * 어드민 프로젝트 단건 필터 key
   *
   * @param {GetAdminProjectParams} params - 조회 파라미터
   * @param {number} params.id - 프로젝트 ID
   */
  adminDetail: (params: GetAdminProjectParams) =>
    [...projectKeys.adminDetails(), params] as const,
};
