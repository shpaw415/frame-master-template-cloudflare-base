import { builder } from "frame-master/build";
import type { FrameMasterConfig } from "frame-master/server/types";
import ApplyReact from "frame-master-plugin-apply-react/plugin";
import AssetsToBuild from "frame-master-plugin-assets-to-build";
import AutoSiteMap from "frame-master-plugin-auto-sitemap";
import imageOptimizer from "frame-master-plugin-image-optimizer";
import ReactToHtml from "frame-master-plugin-react-to-html";
import SEOPlugin from "frame-master-plugin-seo";
import ServeFromBuild from "frame-master-plugin-serve-from-build";
import TailwindPlugin from "frame-master-plugin-tailwind";
import SVGLoader from "frame-master-svg-to-jsx-loader";
import { createElement } from "react";
import SiteConfig from "./site.config";

export default {
	HTTPServer: {
		port: 3001,
	},
	plugins: [
		ReactToHtml({
			shellPath: "src/shell.tsx",
			srcDir: "src/pages",
			asyncFallback: ({ path }) =>
				createElement("div", null, `Loading ${path}...`),
		}),
		ApplyReact({
			clientShellPath: "src/client-wrapper.tsx",
			route: "src/pages",
			style: "nextjs",
			hydration: "hydrate",
			fallbacks: {
				defaultLoadingComponentPath: "src/components/loading.tsx",
				defaultNotFoundComponentPath: "src/components/404.tsx",
			},
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
			sizes: [320, 720, 1280],
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
				{
					src: "assets",
					dist: "assets",
				},
				{
					src: "robots.txt",
					dist: "robots.txt",
				},
			],
		}),
		SEOPlugin(SiteConfig.SEO),
		AutoSiteMap({
			baseUrl: SiteConfig.siteUrl,
			authorizedExtensions: ["html"],
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
		{
			name: "dev-plugin",
			version: "1.0.0",
			fileSystemWatchDir: ["src"],
			async onFileSystemChange(_ev, _fp, abs) {
				if (!abs.startsWith("src/") || builder?.isBuilding()) return;
				await builder?.build();
			},
		},
		ServeFromBuild({
			buildDir: ".frame-master/build",
			plainURLPaths: ["index.html"],
			buildOnDevStart: true,
		}),
	],
} satisfies FrameMasterConfig;
