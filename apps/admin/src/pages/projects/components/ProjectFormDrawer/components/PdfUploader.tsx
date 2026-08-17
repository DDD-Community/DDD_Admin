import { Button } from "@heroui/react"
import { useFormContext, useWatch } from "react-hook-form"

import type { ProjectFormValues } from "@/entities/project"
import {
  toAcceptAttribute,
  toMegabytes,
  useFileUploadFlow,
} from "@/entities/storage"
import { cn } from "@/shared/lib/cn"

/** URL 마지막 세그먼트를 파일명으로 표시 (파싱 실패 시 전체 URL) */
const fileNameFromUrl = (url: string): string => {
  try {
    const path = new URL(url).pathname
    return decodeURIComponent(path.slice(path.lastIndexOf("/") + 1)) || url
  } catch {
    return url
  }
}

export const PdfUploader = () => {
  const { control, setValue } = useFormContext<ProjectFormValues>()
  const url = useWatch({ control, name: "pdfUrl" })

  const { upload, isUploading, constraint } = useFileUploadFlow({
    category: "project-pdf",
    failureTitle: "PDF 업로드에 실패했습니다",
    onUploaded: (uploadedUrl) =>
      setValue("pdfUrl", uploadedUrl, { shouldValidate: true }),
  })

  const handleClear = () => setValue("pdfUrl", "", { shouldValidate: true })

  return (
    <div className="space-y-2">
      {url ? (
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-sm text-blue-600 underline"
          >
            {fileNameFromUrl(url)}
          </a>
          <Button size="sm" variant="outline" onPress={handleClear}>
            제거
          </Button>
        </div>
      ) : (
        <label
          className={cn(
            "flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-8 text-center transition hover:border-blue-400",
            isUploading && "pointer-events-none opacity-60",
          )}
        >
          <input
            type="file"
            accept={toAcceptAttribute(constraint)}
            className="hidden"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) upload(file)
              event.target.value = ""
            }}
          />
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              {isUploading ? "업로드 중..." : "PDF를 클릭해서 업로드"}
            </p>
            <p className="text-xs text-gray-400">
              PDF (최대 {toMegabytes(constraint.maxBytes)}MB)
            </p>
          </div>
        </label>
      )}
    </div>
  )
}
