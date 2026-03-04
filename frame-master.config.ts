import type { FrameMasterConfig } from "frame-master/server/types";
import ReactToHtml from "frame-master-plugin-react-to-html";
import ApplyReact from "frame-master-plugin-apply-react/plugin";
import TailwindPlugin from "frame-master-plugin-tailwind";
import imageOptimizer from "frame-master-plugin-image-optimizer";
import AssetsToBuild from "frame-master-plugin-assets-to-build";
import SVGLoader from "frame-master-svg-to-jsx-loader";

export default {
  HTTPServer: {
    port: 3001,
  },
  plugins: [
    ReactToHtml({
      shellPath: "src/shell.tsx",
      srcDir: "src/pages",
    }),
    ApplyReact({
      clientShellPath: "src/client-wrapper.tsx",
      route: "src/pages",
      style: "nextjs",
    }),
    TailwindPlugin({
      inputFile: "static/tailwind.css",
      outputFile: "static/style.css",
      options: {
        autoInjectInBuild: true,
        runtime: "bun",
      },
    }),
    imageOptimizer({
      input: "images",
      output: "optimized",
      skipExisting: true,
      formats: ["webp"],
      keepOriginal: true,
      sizes: [300, 720, 1280],
    }),
    SVGLoader(),
    AssetsToBuild({
      paths: [
        {
          src: "optimized",
          dist: "optimized",
        },
        {
          src: "static/favicon.ico",
          dist: "favicon.ico",
        },
      ],
    }),
    {
      name: "static-assets",
      version: "1.0.0",
      build: {
        buildConfig: {
          naming: {
            asset: "[dir]/[name].[ext]",
          },
        },
      },
    },
  ],
} satisfies FrameMasterConfig;
