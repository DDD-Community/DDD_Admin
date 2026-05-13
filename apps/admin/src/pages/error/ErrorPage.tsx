import {
  useRouteError,
  isRouteErrorResponse,
  type ErrorResponse,
} from "react-router"
import { FlexBox } from "@/shared/ui/FlexBox"
import { HugeiconsIcon } from "@hugeicons/react"
import { RssErrorIcon } from "@hugeicons/core-free-icons"

export const ErrorPage = () => {
  const error = useRouteError()

  // 400 ~ 500대 에러인지를 판단, 에러 status에 따라 다른 에러 UI 렌더링
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404:
        return <NotFound />
      default:
        return <UnexpectedError error={error} />
    }
  }

  return <UnexpectedError error={error as ErrorResponse} />
}

const NotFound = () => {
  return (
    <FlexBox direction="column" className="h-screen w-screen justify-center">
      <HugeiconsIcon icon={RssErrorIcon} size={64} className="mb-4" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg">페이지를 찾을 수 없습니다.</p>
    </FlexBox>
  )
}

const UnexpectedError = ({ error }: { error: ErrorResponse }) => {
  return (
    <FlexBox direction="column" className="h-screen w-screen justify-center">
      <HugeiconsIcon icon={RssErrorIcon} size={64} className="mb-4" />
      <h1 className="text-4xl font-bold">예상치 못한 오류</h1>
      <p className="text-lg">예상치 못한 오류가 발생했습니다.</p>
      <p className="mt-2 text-sm text-gray-500">{error.statusText}</p>
    </FlexBox>
  )
}
