import { Button, Table } from "@heroui/react"

import type { CohortDto, ProjectDto, ProjectPlatform } from "@ddd/api"

import { PLATFORM_LABEL } from "@/entities/project"
import { cn } from "@/shared/lib/cn"

type ProjectsTableProps = {
  projects: ProjectDto[]
  cohortById: Map<number, CohortDto>
  onEdit: (project: ProjectDto) => void
  onDelete: (project: ProjectDto) => void
}

export const ProjectsTable = ({
  projects,
  cohortById,
  onEdit,
  onDelete,
}: ProjectsTableProps) => {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="프로젝트 목록" className="min-w-225">
          <Table.Header>
            <Table.Column>썸네일</Table.Column>
            <Table.Column isRowHeader>서비스명</Table.Column>
            <Table.Column>플랫폼</Table.Column>
            <Table.Column>기수</Table.Column>
            <Table.Column>한줄 설명</Table.Column>
            <Table.Column>참여자</Table.Column>
            <Table.Column>액션</Table.Column>
          </Table.Header>

          <Table.Body>
            {projects.map((project) => (
              <Table.Row key={project.id}>
                <Table.Cell>
                  <Thumbnail
                    src={project.thumbnailUrl}
                    alt={`${project.name} 썸네일`}
                  />
                </Table.Cell>
                <Table.Cell>
                  <span className="font-semibold">{project.name}</span>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-wrap gap-1">
                    {project.platforms.map((p) => (
                      <PlatformTag key={p} platform={p} />
                    ))}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span className="font-mono text-sm">
                    {cohortById.get(project.cohortId)?.name ?? "-"}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-muted-foreground line-clamp-1 max-w-55 text-xs">
                    {project.description}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span className="font-mono text-sm">
                    {project.members?.length ?? 0}명
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => onEdit(project)}
                    >
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onPress={() => onDelete(project)}
                    >
                      삭제
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}

const Thumbnail = ({ src, alt }: { src?: string | null; alt: string }) => {
  if (!src) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs text-gray-400">
        N/A
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-10 w-10 rounded object-cover"
      loading="lazy"
    />
  )
}

const PLATFORM_TAG_STYLE: Record<ProjectPlatform, string> = {
  IOS: "bg-blue-500/10 text-blue-600",
  AOS: "bg-green-500/10 text-green-600",
  WEB: "bg-purple-500/10 text-purple-600",
}

const PlatformTag = ({ platform }: { platform: ProjectPlatform }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 font-mono text-xs font-medium",
        PLATFORM_TAG_STYLE[platform]
      )}
    >
      {PLATFORM_LABEL[platform]}
    </span>
  )
}
