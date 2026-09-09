import path from "path"
import { defineConfig } from "vitest/config"

// 면접 시각 계산은 브라우저 로컬(KST) 기준이라 테스트도 같은 타임존으로 고정한다.
process.env.TZ = "Asia/Seoul"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
