import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { projectKeys, projectMutations } from "@ddd/api"
import type {
  PostCreateProjectRequest,
  PutUpdateProjectRequest,
} from "@ddd/api"

import type { ProjectFormValues } from "./projectForm"

type Mode = "create" | "edit"

interface Args {
  mode: Mode
  /** edit 에서 채워짐. create 모드면 null */
  targetId: number | null
  /** 성공 시 호출 (Drawer 닫기 등) */
  onSuccess?: () => void
}

/**
 * 프로젝트 등록/수정 흐름 훅.
 * - mode=create   → POST /admin/projects
 * - mode=edit     → PUT /admin/projects/:targetId  + PUT /admin/projects/:targetId/members
 */
export const useCreateOrUpdateProjectFlow = ({
  mode,
  targetId,
  onSuccess,
}: Args) => {
  const queryClient = useQueryClient()
  const createProject = useMutation(projectMutations.createProject())
  const updateProject = useMutation(projectMutations.updateProject())
  const updateMembers = useMutation(projectMutations.updateProjectMembers())

  const isPending =
    createProject.isPending ||
    updateProject.isPending ||
    updateMembers.isPending

  const submit = async (values: ProjectFormValues) => {
    try {
      if (mode === "create") {
        const payload: PostCreateProjectRequest = {
          cohortId: values.cohortId,
          platforms: values.platforms,
          name: values.name,
          description: values.description,
          ...(values.thumbnailUrl ? { thumbnailUrl: values.thumbnailUrl } : {}),
          ...(values.pdfUrl ? { pdfUrl: values.pdfUrl } : {}),
          members: values.members,
        }
        await createProject.mutateAsync({ payload })
        toast.success("프로젝트가 저장되었습니다", {
          description: "홈페이지에 노출됩니다.",
        })
      } else {
        if (targetId == null) {
          toast.danger("저장할 프로젝트를 찾을 수 없습니다")
          return
        }
        const payload: PutUpdateProjectRequest = {
          platforms: values.platforms,
          name: values.name,
          description: values.description,
          ...(values.thumbnailUrl ? { thumbnailUrl: values.thumbnailUrl } : {}),
          ...(values.pdfUrl ? { pdfUrl: values.pdfUrl } : {}),
        }
        await updateProject.mutateAsync({
          params: { id: targetId },
          payload,
        })
        await updateMembers.mutateAsync({
          params: { id: targetId },
          payload: { members: values.members },
        })
        toast.success("프로젝트가 수정되었습니다")
      }

      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      onSuccess?.()
    } catch (error) {
      toast.danger("저장에 실패했습니다", {
        description: (error as Error).message,
      })
    }
  }

  return { submit, isPending }
}
