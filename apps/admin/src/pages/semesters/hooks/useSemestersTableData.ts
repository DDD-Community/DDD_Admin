import { useMemo } from "react"

import { useQueries, useQuery } from "@tanstack/react-query"

import {
  applicationQueries,
  cohortQueries,
  projectQueries,
} from "@ddd/api"

import type {
  ApplicationDto,
  CohortDto,
  CohortStatus,
  ProjectDto,
} from "@ddd/api"

import { STATUS_LABEL } from "../../../entities/cohort"

export interface CohortRow extends CohortDto {
  /** 해당 cohort 의 지원자 수. fetch 실패 시 null → UI 에 "-" */
  applicantsCount: number | null
  /** 해당 cohort 의 멤버 수 합. fetch 실패 시 null */
  membersCount: number | null
}

export interface SemestersSummary {
  totalCohorts: number
  /** 표시 라벨. cohort 가 없으면 "기수 없음" */
  currentStatusLabel: string
  totalApplicants: number
  totalMembers: number
}

interface Result {
  tableRows: CohortRow[]
  summary: SemestersSummary
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

/**
 * cohort 목록 + cohort별 application 카운트 + admin projects 를 조합해
 * 테이블 행과 요약 카드 데이터를 산출한다.
 *
 * - cohort fetch 가 실패하면 isError=true (페이지 전체 ErrorState 노출 신호)
 * - applications/projects 의 부분 실패는 행/카드 단위 graceful degrade
 */
export const useSemestersTableData = (): Result => {
  const cohortsQuery = useQuery(cohortQueries.getCohorts())
  const projectsQuery = useQuery(projectQueries.getAdminProjects())

  const cohorts: CohortDto[] = useMemo(
    () => cohortsQuery.data ?? [],
    [cohortsQuery.data],
  )

  const applicationsByCohort = useQueries({
    queries: cohorts.map((c) =>
      applicationQueries.getAdminApplications({
        params: { cohortId: c.id },
      }),
    ),
  })

  const tableRows: CohortRow[] = useMemo(() => {
    const projects: ProjectDto[] = projectsQuery.data ?? []
    const projectsFailed = projectsQuery.isError

    return cohorts
      .slice()
      .sort((a, b) => b.id - a.id) // id desc
      .map((c) => {
        const idx = cohorts.findIndex((x) => x.id === c.id)
        const appQuery = applicationsByCohort[idx]
        const apps: ApplicationDto[] | undefined = appQuery?.data
        const appsFailed = appQuery?.isError === true

        const applicantsCount = appsFailed
          ? null
          : apps
            ? apps.length
            : 0

        const membersCount = projectsFailed
          ? null
          : projects
              .filter((p) => p.cohortId === c.id)
              .reduce((sum, p) => sum + (p.members?.length ?? 0), 0)

        return { ...c, applicantsCount, membersCount }
      })
  }, [cohorts, applicationsByCohort, projectsQuery.data, projectsQuery.isError])

  const summary: SemestersSummary = useMemo(() => {
    const sortedDesc = cohorts.slice().sort((a, b) => b.id - a.id)
    const latestStatus: CohortStatus | undefined = sortedDesc[0]?.status

    const totalApplicants = tableRows.reduce(
      (sum, r) => sum + (r.applicantsCount ?? 0),
      0,
    )
    const totalMembers = tableRows.reduce(
      (sum, r) => sum + (r.membersCount ?? 0),
      0,
    )

    return {
      totalCohorts: cohorts.length,
      currentStatusLabel: latestStatus ? STATUS_LABEL[latestStatus] : "기수 없음",
      totalApplicants,
      totalMembers,
    }
  }, [cohorts, tableRows])

  return {
    tableRows,
    summary,
    isLoading: cohortsQuery.isLoading,
    isError: cohortsQuery.isError,
    refetch: () => {
      cohortsQuery.refetch()
      projectsQuery.refetch()
    },
  }
}
