import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3200);
const ADMIN = /admin\.spec\.ts/;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Uses the locally installed Chrome; set PW_CHANNEL= (empty) to use Playwright's bundled Chromium.
    channel: process.env.PW_CHANNEL ?? 'chrome',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', testIgnore: ADMIN, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', testIgnore: ADMIN, use: { ...devices['Pixel 7'] } },
    // The admin specs publish and delete a tour, which changes the catalogue the other specs
    // count, so they run on their own after everything else.
    { name: 'admin', testMatch: ADMIN, dependencies: ['desktop', 'mobile'], use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: { DATA_DIR: '.data-test', RATE_LIMIT: 'off', ADMIN_TOKEN: 'test-admin-token', ADMIN_PASSWORD: 'test-admin-password', NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}` },
  },
});
