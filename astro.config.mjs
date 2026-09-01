// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://vintage-guide.example",
  trailingSlash: "always",
  build: { format: "directory" },
});
