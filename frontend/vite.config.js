import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import packageJson from './package.json';

// Obtiene el tag más reciente de git (ej. "v2.1.1" o "v2.2.0"), o fallback al version de package.json
function getAppVersion() {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
  } catch {
    return `v${packageJson.version}`;
  }
}
export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(getAppVersion())
  }
});