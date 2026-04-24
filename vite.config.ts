import { defineConfig } from 'vite';

export default defineConfig({
    base: '/',
    appType: 'spa',
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
    preview: {
        host: '0.0.0.0',
    },
    server: {
        host: '0.0.0.0',
    },
});
