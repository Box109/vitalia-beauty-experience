import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// base './' permite publicar en GitHub Pages (https://usuario.github.io/repositorio/) y en cualquier hosting estático.
export default defineConfig({ base: './', plugins: [react()] });
