import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))
const staticAssets = [
    'asset/ecommerce-orders.csv',
    'lib/realpivot2-lic.js',
    'lib/realpivot2.js',
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
        open: true,
    },
    preview: {
        host: 'localhost',
        open: true,
    },
    build: {
        rollupOptions: {
            input: {
                index: `${root}index.html`,
                plain: `${root}00-plain.html`,
                databar: `${root}01-databar.html`,
                heatmap: `${root}02-heatmap.html`,
                highlight: `${root}03-highlight.html`,
                icon: `${root}04-icon.html`,
                showas: `${root}05-showas.html`,
                series: `${root}06-series.html`,
            },
        },
    },
})
