import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button, Drawer, Input, TextArea, toast } from "@heroui/react"

import { blogKeys, blogMutations } from "@ddd/api"
import type {
  BlogPostDto,
  PostCreateBlogPostRequest,
  PatchUpdateBlogPostRequest,
} from "@ddd/api"

import { useFileUploadFlow } from "@/entities/storage"
import { cn } from "@/shared/lib/cn"
import { useIsMobile } from "@/shared/hooks/useIsMobile"
import { FormField } from "@/shared/ui/FormField"
import { Section } from "@/shared/ui/Section"

// ───── Form schema ───────────────────────────────────────────────────────────

const blogPostFormSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해 주세요.")
    .max(200, "200자 이하로 입력해 주세요."),
  excerpt: z
    .string()
    .min(1, "본문 일부를 입력해 주세요.")
    .max(500, "500자 이하로 입력해 주세요."),
  thumbnail: z
    .string()
    .url("URL 형식이 아닙니다.")
    .optional()
    .or(z.literal("")),
  externalUrl: z.string().url("URL 형식이 아닙니다."),
})

export type BlogPostFormValues = z.infer<typeof blogPostFormSchema>

// ───── Component ─────────────────────────────────────────────────────────────

export type BlogPostFormDrawerMode = "create" | "edit"

type BlogPostFormDrawerProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: BlogPostFormDrawerMode
  post?: BlogPostDto
}

const buildDefaults = (post?: BlogPostDto): BlogPostFormValues => ({
  title: post?.title ?? "",
  excerpt: post?.excerpt ?? "",
  thumbnail: post?.thumbnail ?? "",
  externalUrl: post?.externalUrl ?? "",
})

export const BlogPostFormDrawer = ({
  isOpen,
  onOpenChange,
  mode,
  post,
}: BlogPostFormDrawerProps) => {
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: buildDefaults(post),
  })

  useEffect(() => {
    if (isOpen) reset(buildDefaults(post))
  }, [isOpen, mode, post, reset])

  const createBlogPost = useMutation(blogMutations.createBlogPost())
  const updateBlogPost = useMutation(blogMutations.updateBlogPost())
  const { upload: uploadThumbnail, isUploading } = useFileUploadFlow({
    category: "blog-thumbnail",
    failureTitle: "썸네일 업로드에 실패했습니다",
    onUploaded: (url) => setValue("thumbnail", url, { shouldValidate: true }),
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (mode === "create") {
        const payload: PostCreateBlogPostRequest = {
          title: values.title,
          excerpt: values.excerpt,
          externalUrl: values.externalUrl,
          ...(values.thumbnail ? { thumbnail: values.thumbnail } : {}),
        }
        await createBlogPost.mutateAsync({ payload })
        toast.success("블로그가 저장되었습니다", {
          description: "홈페이지 블로그 섹션에 노출됩니다.",
        })
      } else if (post) {
        const payload: PatchUpdateBlogPostRequest = {
          title: values.title,
          excerpt: values.excerpt,
          externalUrl: values.externalUrl,
          ...(values.thumbnail ? { thumbnail: values.thumbnail } : {}),
        }
        await updateBlogPost.mutateAsync({
          params: { id: post.id },
          payload,
        })
        toast.success("블로그가 수정되었습니다")
      }

      queryClient.invalidateQueries({ queryKey: blogKeys.all })
      onOpenChange(false)
    } catch (error) {
      toast.danger("저장에 실패했습니다", {
        description: (error as Error).message,
      })
    }
  })

  const thumbnailUrl = useWatch({ control, name: "thumbnail" })

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog
          className={!isMobile ? "w-full max-w-1/2 bg-gray-50" : ""}
        >
          <Drawer.Header>
            <Drawer.Heading className="text-lg font-semibold">
              {mode === "create" ? "블로그 등록" : "블로그 수정"}
            </Drawer.Heading>
          </Drawer.Header>

          <Drawer.Body className="flex-1 space-y-6 overflow-y-auto">
            <Section title="블로그 정보">
              <FormField label="썸네일 이미지">
                <ThumbnailUploader
                  url={thumbnailUrl}
                  isUploading={isUploading}
                  onSelect={uploadThumbnail}
                  onClear={() =>
                    setValue("thumbnail", "", { shouldValidate: true })
                  }
                />
              </FormField>

              <FormField label="제목" error={errors.title?.message}>
                <Input
                  {...register("title")}
                  placeholder="블로그 포스트 제목"
                  className="w-full"
                />
              </FormField>

              <FormField label="본문 일부" error={errors.excerpt?.message}>
                <TextArea
                  {...register("excerpt")}
                  placeholder="목록에 노출될 본문 요약 (2~3문장)"
                  className="min-h-24 w-full resize-none"
                />
              </FormField>

              <FormField
                label="외부 링크 URL"
                error={errors.externalUrl?.message}
              >
                <Input
                  {...register("externalUrl")}
                  placeholder="https://brunch.co.kr/..."
                  className="w-full"
                />
              </FormField>
            </Section>
          </Drawer.Body>

          <Drawer.Footer className="gap-2">
            <Drawer.CloseTrigger />
            <Button onPress={() => onSubmit()} isDisabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}

// ───── Subcomponents ─────────────────────────────────────────────────────────

type ThumbnailUploaderProps = {
  url?: string
  isUploading: boolean
  onSelect: (file: File) => void
  onClear: () => void
}

const ThumbnailUploader = ({
  url,
  isUploading,
  onSelect,
  onClear,
}: ThumbnailUploaderProps) => {
  return (
    <div className="space-y-2">
      {url ? (
        <div className="relative inline-block">
          <img
            src={url}
            alt="썸네일 미리보기"
            className="h-24 w-24 rounded-md border border-gray-200 object-cover"
          />
          <Button
            size="sm"
            variant="outline"
            onPress={onClear}
            className="ml-2"
          >
            제거
          </Button>
        </div>
      ) : (
        <label
          className={cn(
            "flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-8 text-center transition hover:border-blue-400",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onSelect(file)
            }}
          />
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              {isUploading ? "업로드 중..." : "이미지를 클릭해서 업로드"}
            </p>
            <p className="text-xs text-gray-400">PNG, JPG (최대 5MB)</p>
          </div>
        </label>
      )}
    </div>
  )
}
