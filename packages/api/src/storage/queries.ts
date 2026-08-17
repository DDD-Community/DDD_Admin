import { mutationOptions } from "@tanstack/react-query";
import { storageApi } from "./api";
import type { PostUploadFileParams } from "./types";

export const storageMutations = {
  /**
   * 파일 업로드 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(storageMutations.uploadFile())
   * mutation.mutate({ params: { category: 'project-pdf' }, file })
   */
  uploadFile: () =>
    mutationOptions({
      mutationFn: ({
        params,
        file,
      }: {
        params: PostUploadFileParams;
        file: File;
      }) => storageApi.uploadFile({ params, file }),
    }),
};
