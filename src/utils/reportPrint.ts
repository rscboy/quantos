export type ReportLine = {
  label: string;
  value: string;
};

export type ReportSection = {
  title: string;
  lines: ReportLine[];
};

type PrintReportOptions = {
  title: string;
  subtitle?: string;
  sections: ReportSection[];
  disclaimer?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSections(sections: ReportSection[]) {
  return sections
    .filter((section) => section.lines.some((line) => `${line.value}`.trim().length > 0))
    .map((section) => `
      <section class="section">
        <h2>${escapeHtml(section.title)}</h2>
        <div class="grid">
          ${section.lines
            .filter((line) => `${line.value}`.trim().length > 0)
            .map((line) => `
              <div class="row">
                <div class="label">${escapeHtml(line.label)}</div>
                <div class="value">${escapeHtml(line.value)}</div>
              </div>
            `)
            .join('')}
        </div>
      </section>
    `)
    .join('');
}

export function generateReportHtml({ title, subtitle, sections, disclaimer, isEmail = false }: PrintReportOptions & { isEmail?: boolean }) {
  const generatedAt = new Date().toLocaleString();
  const sectionMarkup = renderSections(sections);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} | FedCalc by Quantos</title>
    <style>
      :root {
        --navy: #0d2346;
        --blue: #2f6fe4;
        --blue-soft: #eef4ff;
        --border: #d9e2f2;
        --text: #132238;
        --muted: #5e6c84;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, Arial, sans-serif;
        color: var(--text);
        background: #f4f7fb;
      }
      .page {
        max-width: 960px;
        margin: 0 auto;
        background: white;
        min-height: 100vh;
      }
      .header {
        background: linear-gradient(135deg, var(--navy), #16356b);
        color: white;
        padding: 32px 40px;
      }
      .brand {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }
      .brand-title {
        font-size: 30px;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .brand-subtitle {
        margin-top: 6px;
        font-size: 12px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.7);
      }
      .badge {
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 999px;
        padding: 8px 14px;
        font-size: 12px;
        white-space: nowrap;
      }
      .hero {
        padding: 28px 40px 18px;
        border-bottom: 1px solid var(--border);
      }
      h1 {
        margin: 0;
        font-size: 32px;
        line-height: 1.15;
      }
      .subtitle {
        margin-top: 10px;
        color: var(--muted);
        font-size: 15px;
        line-height: 1.6;
      }
      .generated {
        margin-top: 14px;
        color: var(--muted);
        font-size: 12px;
      }
      .content {
        padding: 24px 40px 40px;
      }
      .section {
        margin-bottom: 24px;
        border: 1px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
      }
      .section h2 {
        margin: 0;
        padding: 14px 18px;
        background: var(--blue-soft);
        color: var(--navy);
        font-size: 16px;
      }
      .grid { padding: 6px 18px 12px; }
      .row {
        display: grid;
        grid-template-columns: minmax(220px, 1fr) minmax(180px, 1fr);
        gap: 20px;
        padding: 12px 0;
        border-bottom: 1px solid #edf1f7;
      }
      .row:last-child { border-bottom: none; }
      .label {
        color: var(--muted);
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .value {
        text-align: right;
        font-size: 15px;
        font-weight: 600;
        white-space: pre-wrap;
      }
      .footer {
        padding: 0 40px 32px;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.6;
      }
      @media print {
        body { background: white; }
        .page { max-width: none; }
      }
      @media (max-width: 640px) {
        .header, .hero, .content, .footer { padding-left: 20px; padding-right: 20px; }
        .brand { flex-direction: column; align-items: flex-start; }
        .row { grid-template-columns: 1fr; gap: 6px; }
        .value { text-align: left; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <header class="header">
        <div class="brand">
          <div>
            <div class="brand-title">FedCalc</div>
            <div class="brand-subtitle">by Quantos</div>
          </div>
          ${!isEmail ? `<div class="badge">Friendly Printer Version</div>` : ''}
        </div>
      </header>
      <div class="hero">
        <h1>${escapeHtml(title)}</h1>
        ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ''}
        <div class="generated">Generated ${escapeHtml(generatedAt)}</div>
      </div>
      <main class="content">
        ${sectionMarkup}
      </main>
      <footer class="footer">
        <strong>FedCalc by Quantos.</strong> ${escapeHtml(disclaimer || 'Calculator outputs are estimates based on the information provided.')}
      </footer>
    </div>
    ${!isEmail ? `
    <script>
      window.addEventListener('load', () => {
        setTimeout(() => window.print(), 250);
      });
    </script>
    ` : ''}
  </body>
</html>`;
}

export function openBrandedPrintReport(options: PrintReportOptions) {
  const content = generateReportHtml({ ...options, isEmail: false });

  // Try the Blob approach first as it is more reliable in sandboxed iframes
  try {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.focus();
      // Clean up the URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      return;
    }
  } catch (e) {
    console.error('Blob approach failed, falling back to document.write', e);
  }

  // Fallback to document.write if Blob fails or window.open returns null
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to view the print report.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
}