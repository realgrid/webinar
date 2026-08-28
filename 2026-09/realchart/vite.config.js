import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))
const staticAssets = [
    'lib/realchart-lic.js',
    'lib/realchart.js',
    'lib/realchart-style.css',
    'tooltip-webinar-playground.js',
    'tooltip-webinar-text.js',
    'tooltip-webinar-callback.js',
    'tooltip-webinar-list.js',
    'tooltip-webinar-format.js',
    'tooltip-webinar-scope.js',
    'tooltip-webinar-crosshair.js',
    'tooltip-webinar-shape.js',
    'tooltip-webinar-css.js',
]

function copyStaticAssets() {
    return {
        name: 'copy-static-assets',
        apply: 'build',
        async buildStart() {
            await Promise.all(
                staticAssets.map(async (fileName) => {
                    this.emitFile({
                        type: 'asset',
                        fileName,
                        source: await readFile(`${root}${fileName}`),
                    })
                }),
            )
        },
    }
}

export default defineConfig({
    base: './',
    plugins: [copyStaticAssets()],
    server: {
        host: 'localhost',
        open: '/index.html',
    },
    preview: {
        host: 'localhost',
        open: '/index.html',
    },
    build: {
        rollupOptions: {
            input: {
                index: `${root}index.html`,
            },
        },
    },
})
