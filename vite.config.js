import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Libraries change far less often than the game code. Giving them their own
        // files means a returning visitor re-downloads only the (small) app chunk
        // after each deploy, and the browser can fetch the pieces in parallel.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "vendor-react";
          if (/node_modules\/(gsap|@gsap)\//.test(id) && !/SplitText|ScrollTrigger/.test(id)) return "vendor-gsap";
          return undefined; // supabase, lenis, analytics etc. fall into the lazy chunk that uses them
        },
      },
    },
  },
});
