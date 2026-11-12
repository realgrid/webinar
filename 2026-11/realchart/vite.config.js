import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
    base: './',
    publicDir: 'lib',
    build: {
        rollupOptions: {
            input: {
                main: fileURLToPath(new URL('./index.html', import.meta.url)),
                s1_split: fileURLToPath(new URL('./stages/1-split/index.html', import.meta.url)),
                s2_title_legend: fileURLToPath(new URL('./stages/2-title-legend/index.html', import.meta.url)),
                s3_shared_xaxis: fileURLToPath(new URL('./stages/3-shared-xaxis/index.html', import.meta.url)),
                s4_product_profit: fileURLToPath(new URL('./stages/4-product-profit/index.html', import.meta.url)),
                s5_selection: fileURLToPath(new URL('./stages/5-selection/index.html', import.meta.url)),
                final: fileURLToPath(new URL('./stages/final/index.html', import.meta.url)),
            },
        },
    },
})
