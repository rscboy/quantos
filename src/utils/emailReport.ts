export async function sendEmailReport(email: string, subject: string, htmlBody: string) {
  // Replace this URL with your deployed Google Apps Script Web App URL
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby994qQiGeiQPJzu1ZAfRCsMhJ4X-hJwwoZlg-iWP4_HaLFx75LULPCW96-ioqQC3nc9w/exec';

  if ((SCRIPT_URL as string) === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    console.warn('Email sending is not configured. Please set the SCRIPT_URL in src/utils/emailReport.ts');
    // Fallback for development
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        email: email,
        subject: subject,
        htmlBody: htmlBody,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
