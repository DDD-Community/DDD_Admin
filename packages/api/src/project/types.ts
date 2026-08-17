import type { components, paths } from "../generated/api";

// Request DTO
export type CreateProjectRequestDto = components["schemas"]["CreateProjectRequestDto"];
export type UpdateProjectRequestDto = components["schemas"]["UpdateProjectRequestDto"];
export type UpdateProjectMembersRequestDto =
  components["schemas"]["UpdateProjectMembersRequestDto"];
export type ProjectMemberRequestDto = components["schemas"]["ProjectMemberRequestDto"];

// GET /api/v1/projects - 공개 목록 조회 (커서 페이지네이션)
export type GetProjectsParams =
  paths["/api/v1/projects"]["get"]["parameters"]["query"];
export type GetProjectsResponse = PublicProjectDto[];
export type GetInfiniteProjectsParams = Omit<NonNullable<GetProjectsParams>, "cursor">;

// GET /api/v1/projects/{id} - 공개 단건
export type GetProjectParams = { id: number };
export type GetProjectResponse = ProjectDetailDto;

// GET /api/v1/admin/projects - 어드민 전체 목록 (페이지네이션 없음)
export type GetAdminProjectsResponse = ProjectDto[];

// GET /api/v1/admin/projects/{id} - 어드민 단건
export type GetAdminProjectParams = { id: number };
export type GetAdminProjectResponse = ProjectDetailDto;

// POST /api/v1/admin/projects - 어드민 생성
export type PostCreateProjectRequest = CreateProjectRequestDto;
export type PostCreateProjectResponse = ProjectDetailDto;

// PATCH /api/v1/admin/projects/{id} - 어드민 수정 (data: null)
export type PatchUpdateProjectParams = { id: number };
export type PatchUpdateProjectRequest = UpdateProjectRequestDto;
export type PatchUpdateProjectResponse = null;

// 하위 호환: 기존 PutUpdateProject* alias
/** @deprecated PatchUpdateProjectParams 을 사용하세요 */
export type PutUpdateProjectParams = PatchUpdateProjectParams;
/** @deprecated PatchUpdateProjectRequest 을 사용하세요 */
export type PutUpdateProjectRequest = PatchUpdateProjectRequest;
/** @deprecated PatchUpdateProjectResponse 을 사용하세요 */
export type PutUpdateProjectResponse = PatchUpdateProjectResponse;

// DELETE /api/v1/admin/projects/{id} - 어드민 삭제
export type DeleteProjectParams = { id: number };
export type DeleteProjectResponse = void;

// PUT /api/v1/admin/projects/{id}/members - 어드민 멤버 전체 교체 (data: null)
export type PutUpdateProjectMembersParams = { id: number };
export type PutUpdateProjectMembersRequest = UpdateProjectMembersRequestDto;
export type PutUpdateProjectMembersResponse = null;

// 엔티티 타입 (BE 응답 schema 미정의 → 수동 정의)
export type ProjectPlatform =
  NonNullable<GetProjectsParams>["platform"] extends infer P
    ? P extends string
      ? P
      : never
    : never;
export type ProjectCreatePlatform = CreateProjectRequestDto["platforms"][number];
export type ProjectUpdatePlatform = NonNullable<
  UpdateProjectRequestDto["platforms"]
>[number];
export type ProjectMember = ProjectMemberRequestDto;

/**
 * 공개 목록 항목 - GET /api/v1/projects
 *
 * 무인증 엔드포인트라 참여자(members)·소개 PDF(pdfUrl) 는 내려오지 않는다.
 */
export interface PublicProjectDto {
  id: number;
  cohortId: number;
  cohortName: string | null;
  platforms: ProjectPlatform[];
  name: string;
  description: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

/**
 * 어드민 목록 항목 - GET /api/v1/admin/projects
 *
 * 공개 항목 + `pdfUrl` + `members`. 어드민 수정 드로워는 이 목록 응답만으로
 * 참여자를 채울 수 있어 상세 API 를 추가 호출하지 않는다.
 */
export interface ProjectDto extends PublicProjectDto {
  pdfUrl: string | null;
  members: ProjectMember[];
}

/** 상세 항목 (공개·어드민 공통) - 어드민 목록 항목 + `updatedAt` */
export interface ProjectDetailDto extends ProjectDto {
  updatedAt: string;
}
