import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
} from "@tanstack/react-query";
import { projectAPI } from "./api";
import { projectKeys } from "./queryKeys";
import type {
  GetProjectsParams,
  GetProjectParams,
  GetInfiniteProjectsParams,
  GetAdminProjectParams,
  PostCreateProjectRequest,
  PatchUpdateProjectParams,
  PatchUpdateProjectRequest,
  DeleteProjectParams,
  PutUpdateProjectMembersParams,
  PutUpdateProjectMembersRequest,
} from "./types";

export const projectQueries = {
  /**
   * 프로젝트 공개 목록 조회 쿼리
   *
   * @param {GetProjectsParams} params - 조회 파라미터
   * @param {ProjectPlatform} [params.platform] - 플랫폼 필터 (선택)
   * @param {string} [params.cursor] - 다음 페이지 커서(base64url) (선택)
   * @param {number} [params.limit] - 페이지 크기 (1-100, 선택)
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(projectQueries.getProjects({ params: { platform: 'WEB' } }))
   */
  getProjects: ({ params }: { params: GetProjectsParams }) =>
    queryOptions({
      queryKey: projectKeys.list(params),
      queryFn: () => projectAPI.getProjects({ params }),
    }),

  /**
   * 프로젝트 무한 스크롤 목록 조회 쿼리
   *
   * cursor는 useInfiniteQuery의 pageParam으로 자동 관리되므로
   * params에 cursor를 직접 전달하지 않는다.
   *
   * ⚠️ 다음 커서(`nextCursor`/`hasNext`)는 공통 응답 래퍼의 `data` 가 아니라
   * 형제 필드인 `meta` 로 내려오는데, `ApiClient` 가 `data` 만 반환하며 `meta` 를
   * 버린다. 따라서 현재는 **첫 페이지만** 조회된다. 무한 스크롤이 실제로 필요해지면
   * 클라이언트에 `meta` 전달 경로를 먼저 추가해야 한다.
   *
   * @param {GetInfiniteProjectsParams} params - 조회 파라미터 (cursor 제외)
   * @param {ProjectPlatform} [params.platform] - 플랫폼 필터 (선택)
   * @param {number} [params.limit] - 페이지 크기 (1-100, 선택)
   *
   * @returns {InfiniteQueryOptions} TanStack Query Infinite 옵션 객체
   *
   * @example
   * const query = useInfiniteQuery(projectQueries.getInfiniteProjects({ params: { limit: 20 } }))
   */
  getInfiniteProjects: ({
    params,
  }: {
    params: GetInfiniteProjectsParams;
  }) =>
    infiniteQueryOptions({
      queryKey: projectKeys.infiniteList(params),
      queryFn: ({ pageParam }) =>
        projectAPI.getProjects({ params: { ...params, cursor: pageParam } }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: () => undefined,
    }),

  /**
   * 프로젝트 단일 조회 쿼리
   *
   * @param {GetProjectParams} params - 조회 파라미터
   * @param {number} params.id - 프로젝트 ID
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(projectQueries.getProject({ params: { id: 1 } }))
   */
  getProject: ({ params }: { params: GetProjectParams }) =>
    queryOptions({
      queryKey: projectKeys.detail(params),
      queryFn: () => projectAPI.getProject({ params }),
      enabled: !!params.id,
    }),

  /**
   * 어드민 프로젝트 전체 목록 조회 쿼리 (GET /admin/projects)
   *
   * 어드민 목록 엔드포인트는 쿼리 파라미터·커서를 받지 않고 단일 호출로 모든
   * 프로젝트를 내려준다. 각 항목에 `members` / `pdfUrl` 이 포함되므로 수정 드로워는
   * 상세 API 를 추가 호출하지 않아도 된다. 플랫폼·기수·검색 필터는 클라이언트에서 처리한다.
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   */
  getAdminProjects: () =>
    queryOptions({
      queryKey: projectKeys.adminLists(),
      queryFn: () => projectAPI.getAdminProjects(),
    }),

  /**
   * 어드민 프로젝트 단건 조회 쿼리 (GET /admin/projects/{id})
   *
   * @param {GetAdminProjectParams} params - 조회 파라미터
   * @param {number} params.id - 프로젝트 ID
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(projectQueries.getAdminProject({ params: { id: 1 } }))
   */
  getAdminProject: ({ params }: { params: GetAdminProjectParams }) =>
    queryOptions({
      queryKey: projectKeys.adminDetail(params),
      queryFn: () => projectAPI.getAdminProject({ params }),
      enabled: !!params.id,
    }),
};

export const projectMutations = {
  /**
   * 프로젝트 생성 mutation (어드민)
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(projectMutations.createProject())
   * mutation.mutate({ payload: { cohortId: 1, platforms: ['WEB'], name: '...', description: '...' } })
   */
  createProject: () =>
    mutationOptions({
      mutationFn: ({ payload }: { payload: PostCreateProjectRequest }) =>
        projectAPI.createProject({ payload }),
    }),

  /**
   * 프로젝트 수정 mutation (어드민) - PATCH /admin/projects/{id}
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(projectMutations.updateProject())
   * mutation.mutate({ params: { id: 1 }, payload: { name: '수정된 이름' } })
   */
  updateProject: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: PatchUpdateProjectParams;
        payload: PatchUpdateProjectRequest;
      }) => projectAPI.updateProject({ params, payload }),
    }),

  /**
   * 프로젝트 삭제 mutation (어드민)
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(projectMutations.deleteProject())
   * mutation.mutate({ params: { id: 1 } })
   */
  deleteProject: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: DeleteProjectParams }) =>
        projectAPI.deleteProject({ params }),
    }),

  /**
   * 프로젝트 참여자 수정 mutation (어드민)
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(projectMutations.updateProjectMembers())
   * mutation.mutate({ params: { id: 1 }, payload: { members: [{ name: '홍길동', part: 'FE' }] } })
   */
  updateProjectMembers: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: PutUpdateProjectMembersParams;
        payload: PutUpdateProjectMembersRequest;
      }) => projectAPI.updateProjectMembers({ params, payload }),
    }),
};
