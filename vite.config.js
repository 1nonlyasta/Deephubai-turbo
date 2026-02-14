import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    optimizeDeps: {
      include: [
        "three",
        "gsap",
        "recharts",
        "lucide-react",
        "motion",
        "react-markdown",
        "rehype-katex",
        "remark-math",
      ],
    },
    server: {
      host: true,
      strictPort: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
      },
      warmup: {
        clientFiles: [
          "./src/main.jsx",
          "./src/App.jsx",
          "./src/components/turbo/dashboard/TurboChat.jsx",
        ],
      },
    },
  };
});
