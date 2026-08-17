import { toast } from "@heroui/react"
import { useMutation } from "@tanstack/react-query"

import { FILE_UPLOAD_CONSTRAINTS, storageMutations } from "@ddd/api"
import type { FileUploadCategory } from "@ddd/api"

import { describeUploadError, findUploadRejection } from "../lib/fileUpload"

interface Args {
  category: FileUploadCategory
  /** 업로드 성공 시 반환된 파일 URL */
  onUploaded: (url: string) => void
  /** 실패 토스트 제목 (예: "PDF 업로드에 실패했습니다") */
  failureTitle: string
}

/**
 * 파일 업로드 흐름 훅 — 사전 검증(MIME/용량) → 업로드 → 실패 토스트.
 *
 * 업로드 API 는 저장까지 하지 않는다. 반환된 URL 을 폼 값에 넣고
 * 프로젝트/블로그 저장 API 로 별도 전송해야 실제로 반영된다.
 */
export const useFileUploadFlow = ({
  category,
  onUploaded,
  failureTitle,
}: Args) => {
  const uploadFile = useMutation(storageMutations.uploadFile())
  const constraint = FILE_UPLOAD_CONSTRAINTS[category]

  const upload = async (file: File) => {
    const rejection = findUploadRejection(file, constraint)
    if (rejection) {
      toast.danger(failureTitle, { description: rejection })
      return
    }

    try {
      const uploaded = await uploadFile.mutateAsync({
        params: { category },
        file,
      })
      onUploaded(uploaded.url)
    } catch (error) {
      toast.danger(failureTitle, { description: describeUploadError(error) })
    }
  }

  return { upload, isUploading: uploadFile.isPending, constraint }
}
