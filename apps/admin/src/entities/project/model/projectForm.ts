import { z } from "zod"

import type { ProjectDto } from "@ddd/api"

import { PART_OPTIONS, type ProjectPart } from "./constants"

const memberSchema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요."),
  part: z.enum(PART_OPTIONS),
  review: z.string().optional(),
})

export const projectFormSchema = z.object({
  cohortId: z.number({ message: "기수를 선택해 주세요." }).int().positive(),
  platforms: z
    .array(z.enum(["IOS", "AOS", "WEB"] as const))
    .min(1, "최소 1개 플랫폼을 선택해 주세요."),
  name: z
    .string()
    .min(1, "서비스명을 입력해 주세요.")
    .max(100, "100자 이하로 입력해 주세요."),
  description: z
    .string()
    .min(1, "한줄 설명을 입력해 주세요.")
    .max(200, "200자 이하로 입력해 주세요."),
  thumbnailUrl: z
    .string()
    .url("URL 형식이 아닙니다.")
    .optional()
    .or(z.literal("")),
  pdfUrl: z.string().url("URL 형식이 아닙니다.").optional().or(z.literal("")),
  members: z.array(memberSchema),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

export const buildProjectFormDefaults = (
  project?: ProjectDto,
): ProjectFormValues => ({
  cohortId: project?.cohortId ?? 0,
  platforms: project?.platforms ?? [],
  name: project?.name ?? "",
  description: project?.description ?? "",
  thumbnailUrl: project?.thumbnailUrl ?? "",
  pdfUrl: project?.pdfUrl ?? "",
  members:
    project?.members?.map((m) => ({
      name: m.name,
      part: (PART_OPTIONS.includes(m.part as ProjectPart)
        ? m.part
        : "PM") as ProjectPart,
      review: undefined,
    })) ?? [],
})
