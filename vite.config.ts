import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const SITE_URL = 'https://www.myfedplan.us';
const HOME_TITLE = 'MyFedPlan | Federal Retirement Calculators';
const HOME_DESC =
  'Federal retirement calculators that accurately compute FERS, CSRS, military deposits, TSP, and social security. Also includes savings gap calculator.';

// Each SPA route gets its own static HTML file so it returns HTTP 200 with
// route-specific title/description/canonical when crawled or deep-linked,
// instead of relying on the SPA's client-side routing alone.
const ROUTES: Record<string, { title: string; description: string }> = {
  fers: { title: 'FERS Annuity Calculator | MyFedPlan', description: 'Free FERS retirement calculator. Estimate your Federal Employees Retirement System basic annuity using High-3 salary, years of creditable service, and special provisions.' },
  csrs: { title: 'CSRS Annuity Calculator | MyFedPlan', description: 'Free CSRS pension calculator for the Civil Service Retirement System. Model deposits, redeposits, sick leave credit, and survivor elections.' },
  eligibility: { title: 'Federal Retirement Eligibility Calculator | MyFedPlan', description: 'Find the soonest date you can retire from federal service and still receive an annuity, based on your age and years of creditable service.' },
  tsp: { title: 'TSP Calculator | Thrift Savings Plan Projections | MyFedPlan', description: 'Project your Thrift Savings Plan balance over 5, 10, or 20 years, including agency match and Lifecycle (L) Fund allocation assumptions.' },
  gap: { title: 'Retirement Savings Gap Calculator | MyFedPlan', description: 'See whether your federal pension, Social Security, and TSP savings are on track to cover your projected retirement expenses.' },
  military: { title: 'Military Deposit Calculator | MyFedPlan', description: 'Calculate the military service deposit required to buy back active-duty time and increase your federal retirement annuity.' },
  full: { title: 'Full Federal Retirement Analysis | MyFedPlan', description: 'Run a complete federal retirement analysis combining FERS or CSRS annuity, TSP, Social Security, and savings-gap projections in one place.' },
  ss: { title: 'Social Security Estimator for Federal Employees | MyFedPlan', description: 'Estimate your monthly Social Security benefit at retirement and coordinate it with your federal pension and TSP withdrawals.' },
  guides: { title: 'Federal Retirement Guides | MyFedPlan', description: 'In-depth federal retirement guides covering FERS, CSRS, High-3, MRA, and retirement timing.' },
  about: { title: 'About MyFedPlan | Federal Retirement Planning', description: 'Learn who is behind MyFedPlan, our mission, and how we build federal retirement planning tools.' },
  contact: { title: 'Contact MyFedPlan', description: 'Contact MyFedPlan for calculator support and editorial questions.' },
  methodology: { title: 'Methodology | MyFedPlan', description: 'How MyFedPlan calculators are built, validated, and maintained for federal retirement planning education.' },
  disclaimer: { title: 'Disclaimer | MyFedPlan', description: 'Important legal disclaimer for MyFedPlan tools and educational content.' },
  terms: { title: 'Terms of Service | MyFedPlan', description: 'The terms of service governing use of MyFedPlan calculators and content.' },
  privacy: { title: 'Privacy Policy | MyFedPlan', description: 'Read the MyFedPlan privacy policy, including how we use cookies, analytics, and contact information.' },
  'cookie-policy': { title: 'Cookie Policy | MyFedPlan', description: 'How MyFedPlan uses cookies, consent controls, analytics, and AdSense-related technologies.' },
  openapi: { title: 'API Specification | MyFedPlan', description: 'OpenAPI specification for the MyFedPlan federal retirement calculation API.' },
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function staticRoutesPlugin(): Plugin {
  return {
    name: 'myfedplan-static-routes',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;
      const indexHtml = fs.readFileSync(indexPath, 'utf-8');

      const titleRe = new RegExp(escapeRegExp(HOME_TITLE), 'g');
      const descRe = new RegExp(escapeRegExp(HOME_DESC), 'g');
      const canonicalRe = new RegExp(
        `<link rel="canonical" href="${escapeRegExp(SITE_URL)}/" />`,
      );

      // SPA fallback for any unknown path (served by GitHub Pages as 404.html).
      // Drop the canonical so unknown URLs are not consolidated into the homepage.
      fs.writeFileSync(
        path.join(distDir, '404.html'),
        indexHtml.replace(canonicalRe, ''),
        'utf-8',
      );

      for (const [route, meta] of Object.entries(ROUTES)) {
        const html = indexHtml
          .replace(titleRe, meta.title)
          .replace(descRe, meta.description)
          .replace(canonicalRe, `<link rel="canonical" href="${SITE_URL}/${route}" />`);
        fs.writeFileSync(path.join(distDir, `${route}.html`), html, 'utf-8');
      }
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'MyFedPlan',
          short_name: 'MyFedPlan',
          description: 'Federal retirement calculators including FERS, CSRS, TSP, and more.',
          theme_color: '#0B1F3A',
          background_color: '#F5F6F8',
          display: 'standalone',
          icons: [
            {
              src: 'https://i.postimg.cc/kXVHSmXz/Screenshot-2026-03-13-at-4-57-08-PM.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://i.postimg.cc/kXVHSmXz/Screenshot-2026-03-13-at-4-57-08-PM.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      }),
      staticRoutesPlugin()
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
