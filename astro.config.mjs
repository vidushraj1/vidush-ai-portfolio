// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Your GitHub Pages address. Change "vidushraj1" if your username differs,
  // or use your custom domain (e.g. "https://vidush.dev") if you have one.
  site: "https://vidushraj1.github.io",

  // Your repository name. REMOVE this line if you deploy to
  // https://vidushraj1.github.io (a repo named vidushraj1.github.io)
  // or to a custom domain.
  base: "/vidush-ai-portfolio",

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
});