import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
    // Load env file for the current mode
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            vue(),
            tsconfigPaths(),
        ],
        // Add this resolve block to explicitly define the alias
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        css: {
            postcss: './postcss.config.js',
        },
        build: {
            cssMinify: true,
            minify: true,
            sourcemap: true,
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, 'index.html'),
                },
                external: [],
                output: {
                    manualChunks: (id) => {
                        if (id.includes('highcharts/highcharts')) {
                            return 'highcharts-core';
                        }
                        if (id.includes('highcharts-vue')) {
                            return 'highcharts-vue';
                        }
                        if (id.includes('highcharts/themes/')) {
                            return 'highcharts-themes';
                        }
                    }
                }
            },
            commonjsOptions: {
                include: [/node_modules/],
            }
        },
        server: {
            proxy: {
                '/api/pic': {
                    target: env.VITE_PIC_API_TARGET,
                    changeOrigin: true,
                },
                '/api': {
                    target: env.VITE_API_TARGET,
                    changeOrigin: true,
                },
                '/ws': {
                    target: env.VITE_WS_TARGET,
                    changeOrigin: true,
                    ws: true,
                    secure: false,
                },
            },
        },
        optimizeDeps: {
            include: [
                'highcharts',
                'highcharts-vue',
                'highcharts/themes/dark-unica',
                'highcharts/themes/brand-dark',
                'highcharts/themes/brand-light',
                'highcharts/themes/dark-blue',
                'highcharts/themes/dark-green',
                'highcharts/themes/gray',
                'highcharts/themes/grid',
                'highcharts/themes/grid-light',
                'highcharts/themes/high-contrast-dark',
                'highcharts/themes/high-contrast-light',
                'highcharts/themes/sand-signika',
                'highcharts/themes/skies',
                'highcharts/themes/sunset'
            ]
        },
        assetsInclude: ['**/**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.ico'],
        publicDir: 'public',
    }
});