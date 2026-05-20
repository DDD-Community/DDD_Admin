import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { configureApi } from "@ddd/api"
import { Toast } from "@heroui/react"

import "./index.css"
import Router from "./pages/index.tsx"
import { QueryProvider } from "@/app/providers/QueryProvider.tsx"
import { paths } from "@/shared/lib/paths"

const apiUrl = import.meta.env.VITE_API_URL ?? ""
configureApi(apiUrl, {
  onUnauthorized: () => {
    window.location.replace(paths.login)
  },
})

async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_MSW_ENABLED === "true") {
    const { worker } = await import("./mocks/browser")
    return worker.start({ onUnhandledRequest: "bypass" })
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryProvider>
        <Router />
        <Toast.Provider placement="top end" />
      </QueryProvider>
    </StrictMode>
  )
})
