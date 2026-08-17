import { useMemo } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"

import { projectQueries } from "@ddd/api"
import type { CohortDto, ProjectDto } from "@ddd/api"

import { EmptyState } from "@/shared/ui/EmptyState"
import { FlexBox } from "@/shared/ui/FlexBox"

import { ProjectsTable } from "./components/ProjectsTable"
import type {
  CohortFilterValue,
  PlatformFilterValue,
} from "./components/ProjectsToolbar"

type ProjectsDataViewProps = {
  searchText: string
  platform: PlatformFilterValue
  cohortId: CohortFilterValue
  cohorts: CohortDto[]
  onEdit: (project: ProjectDto) => void
  onDelete: (project: ProjectDto) => void
}

export const ProjectsDataView = ({
  searchText,
  platform,
  cohortId,
  cohorts,
  onEdit,
  onDelete,
}: ProjectsDataViewProps) => {
  // 어드민 목록은 파라미터 없이 전체를 한 번에 내려준다 (커서 페이지네이션 없음).
  const { data } = useSuspenseQuery(projectQueries.getAdminProjects())

  const allProjects = useMemo<ProjectDto[]>(() => data ?? [], [data])

  const cohortById = useMemo(
    () => new Map(cohorts.map((c) => [c.id, c])),
    [cohorts]
  )

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const matchesSearch =
        searchText.length === 0 || project.name.includes(searchText)
      const matchesCohort = cohortId === "ALL" || project.cohortId === cohortId
      const matchesPlatform =
        platform === "ALL" || project.platforms.includes(platform)
      return matchesSearch && matchesCohort && matchesPlatform
    })
  }, [allProjects, searchText, cohortId, platform])

  if (filteredProjects.length === 0) {
    return (
      <EmptyState>
        {allProjects.length === 0
          ? "등록된 프로젝트가 없습니다."
          : "조건에 맞는 프로젝트가 없습니다."}
      </EmptyState>
    )
  }

  return (
    <>
      <ProjectsTable
        projects={filteredProjects}
        cohortById={cohortById}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <FlexBox className="justify-between pt-2">
        <span className="text-muted-foreground text-xs">
          현재 {filteredProjects.length}개 표시
        </span>
      </FlexBox>
    </>
  )
}
