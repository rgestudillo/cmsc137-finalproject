import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const phasermsg = () => {
    return {
        name: 'phasermsg',
        buildStart() {
            process.stdout.write(`Building for production...\n`);
        },
        buildEnd() {
            const line = "---------------------------------------------------------";
            const msg = `❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️`;
            process.stdout.write(`${line}\n${msg}\n${line}\n`);
            process.stdout.write(`✨ Done ✨\n`);
        }
    }
}

export default defineConfig({
    base: './', // Ensures relative paths for Electron compatibility
    plugins: [
        react(),
        phasermsg()
    ],
    logLevel: 'warning',
    build: {
        outDir: 'dist', // Output directory
        target: 'esnext', // Use modern syntax for improved performance
        rollupOptions: {
            output: {
                format: 'iife', // Bundle format to allow direct loading
                // manualChunks: {
                //     phaser: ['phaser'] // Keep Phaser in a separate chunk if needed
                // },
            },
        },
        minify: 'terser', // Minify for production
        terserOptions: {
            compress: {
                passes: 2 // Higher compression for better performance
            },
            mangle: true, // Minify variable names
            format: {
                comments: false // Remove comments for cleaner output
            }
        }
    }
});
