export type TransactionalEmail = {
  subject: string;
  html: string;
  text: string;
};

type CustomerEmailInput = {
  email: string;
  name?: string | null;
};

type PaymentEmailInput = CustomerEmailInput & {
  paymentId?: string | null;
};

type WorkspaceInviteEmailInput = CustomerEmailInput & {
  inviterName?: string | null;
  workspaceName: string;
  inviteUrl: string;
};

type PaymentIssueEmailInput = CustomerEmailInput & {
  status: 'failed' | 'cancelled';
};

type AdminPurchaseEmailInput = PaymentEmailInput & {
  amountLabel?: string;
};

const SITE_URL = 'https://debugtools.org';
const CARD_STYLE = 'max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;padding:32px;';
const BUTTON_STYLE = 'display:inline-block;margin-top:22px;background:#111827;color:#ffffff;text-decoration:none;border-radius:12px;padding:13px 18px;font-weight:700;';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function firstName(name?: string | null) {
  const trimmed = name?.trim();
  return trimmed ? trimmed.split(/\s+/)[0] : 'there';
}

function safeUrl(value: string, fallback = SITE_URL) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.65;">${text}</p>`;
}

function bulletList(items: string[]) {
  return `
    <ul style="margin:0 0 18px;padding-left:20px;color:#334155;font-size:14px;line-height:1.7;">
      ${items.map((item) => `<li>${item}</li>`).join('')}
    </ul>
  `;
}

function wrapEmail({
  eyebrow,
  heading,
  preview,
  body,
}: {
  eyebrow: string;
  heading: string;
  preview: string;
  body: string;
}) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(preview)}</title>
      </head>
      <body style="margin:0;background:#f8fafc;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#0f172a;">
        <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(preview)}</div>
        <div style="${CARD_STYLE}">
          <p style="margin:0 0 12px;color:#2563eb;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
          <h1 style="margin:0 0 14px;font-size:28px;line-height:1.15;color:#020617;">${escapeHtml(heading)}</h1>
          ${body}
          <p style="margin:26px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">DebugTools keeps local tools usable without an account. You are receiving this because this email was used for a DebugTools account, workspace, or checkout.</p>
        </div>
      </body>
    </html>
  `;
}

export function createWelcomeEmail({ name }: CustomerEmailInput): TransactionalEmail {
  const greetingName = escapeHtml(firstName(name));
  const subject = 'Welcome to DebugTools';
  const text = [
    `Hi ${firstName(name)}, welcome to DebugTools.`,
    'Start with API Workbench for requests, collections, auth, environments, and response inspection.',
    'Use the local-first utilities for JSON, JWT, Base64, hash, URL, regex, HTML, SQLite, and more.',
    'Your sensitive inputs stay in your browser unless you choose cloud sync or optional AI.',
    `${SITE_URL}/tools/api/`,
  ].join('\n\n');

  return {
    subject,
    text,
    html: wrapEmail({
      eyebrow: 'Welcome',
      heading: `Welcome, ${greetingName}.`,
      preview: 'Your DebugTools workspace is ready.',
      body: `
        ${paragraph(`Hi ${greetingName}, your DebugTools workspace is ready.`)}
        ${paragraph('Start with the API Workbench, then keep the smaller utilities close for quick debugging work.')}
        ${bulletList([
          'API Workbench for requests, auth, environments, and response inspection.',
          'Local-first utilities for JSON, JWT, Base64, URL, hash, regex, HTML, SQLite, and more.',
          'Tool history and cloud sync when you are signed in.',
        ])}
        <a href="${SITE_URL}/tools/api/" style="${BUTTON_STYLE}">Open API Workbench</a>
      `,
    }),
  };
}

export function createAdFreeConfirmationEmail({
  name,
  paymentId,
}: PaymentEmailInput): TransactionalEmail {
  const greetingName = escapeHtml(firstName(name));
  const safePaymentId = paymentId ? escapeHtml(paymentId) : null;
  const paymentText = paymentId ? `Payment reference: ${paymentId}` : 'Payment reference: not available';

  return {
    subject: 'DebugTools ad-free lifetime pass is active',
    text: [
      `Hi ${firstName(name)}, your DebugTools $3 lifetime pass is active.`,
      'Ads are removed when you are signed in.',
      paymentText,
      `${SITE_URL}/tools/api/`,
    ].join('\n\n'),
    html: wrapEmail({
      eyebrow: 'Ad-free active',
      heading: 'You are ad-free for life.',
      preview: 'Your DebugTools ad-free lifetime pass is active.',
      body: `
        ${paragraph(`Hi ${greetingName}, your $3 lifetime pass is active. Ads are removed when you are signed in.`)}
        ${safePaymentId ? `<p style="margin:0;color:#64748b;font-size:13px;">Payment reference: ${safePaymentId}</p>` : ''}
        <a href="${SITE_URL}/tools/api/" style="${BUTTON_STYLE}">Open DebugTools</a>
      `,
    }),
  };
}

export function createPaymentIssueEmail({
  name,
  status,
}: PaymentIssueEmailInput): TransactionalEmail {
  const greetingName = escapeHtml(firstName(name));
  const cancelled = status === 'cancelled';

  return {
    subject: cancelled ? 'DebugTools checkout was cancelled' : 'DebugTools payment did not go through',
    text: cancelled
      ? [
          `Hi ${firstName(name)}, your DebugTools checkout was cancelled.`,
          'DebugTools still works normally. You can return to the ad-free pass any time.',
          `${SITE_URL}/ad-free`,
        ].join('\n\n')
      : [
          `Hi ${firstName(name)}, your DebugTools payment did not go through.`,
          'Your card was not charged by DebugTools. You can try again from the ad-free page.',
          `${SITE_URL}/ad-free`,
        ].join('\n\n'),
    html: wrapEmail({
      eyebrow: cancelled ? 'Checkout cancelled' : 'Payment issue',
      heading: cancelled ? 'Checkout cancelled.' : 'Payment did not go through.',
      preview: cancelled ? 'Your DebugTools checkout was cancelled.' : 'Your DebugTools payment did not go through.',
      body: `
        ${paragraph(
          cancelled
            ? `Hi ${greetingName}, your checkout was cancelled. DebugTools still works normally, and the ad-free pass is available whenever you want it.`
            : `Hi ${greetingName}, the payment did not go through. Your card was not charged by DebugTools.`
        )}
        <a href="${SITE_URL}/ad-free" style="${BUTTON_STYLE}">${cancelled ? 'Return to DebugTools' : 'Try again'}</a>
      `,
    }),
  };
}

export function createWorkspaceInviteEmail({
  inviterName,
  workspaceName,
  inviteUrl,
}: WorkspaceInviteEmailInput): TransactionalEmail {
  const safeWorkspaceName = escapeHtml(workspaceName);
  const inviter = escapeHtml(inviterName?.trim() || 'A teammate');
  const url = safeUrl(inviteUrl);

  return {
    subject: `Join ${workspaceName} on DebugTools`,
    text: [
      `${inviterName?.trim() || 'A teammate'} invited you to join ${workspaceName} on DebugTools.`,
      'Use the invite link to open the workspace.',
      url,
    ].join('\n\n'),
    html: wrapEmail({
      eyebrow: 'Workspace invite',
      heading: `Join ${safeWorkspaceName}.`,
      preview: `${inviterName?.trim() || 'A teammate'} invited you to DebugTools.`,
      body: `
        ${paragraph(`${inviter} invited you to join ${safeWorkspaceName} on DebugTools.`)}
        ${paragraph('Use the workspace to share API collections, environments, and team debugging context.')}
        <a href="${escapeHtml(url)}" style="${BUTTON_STYLE}">Accept invite</a>
      `,
    }),
  };
}

export function createAdFreeAdminEmail({
  email,
  name,
  paymentId,
  amountLabel = '$3',
}: AdminPurchaseEmailInput): TransactionalEmail {
  const safeEmail = escapeHtml(email);
  const safeName = escapeHtml(name || 'Not provided');
  const safePaymentId = escapeHtml(paymentId || 'Not provided');
  const safeAmount = escapeHtml(amountLabel);

  return {
    subject: 'New DebugTools ad-free lifetime pass',
    text: [
      'New DebugTools ad-free purchase',
      `Email: ${email}`,
      `Name: ${name || 'Not provided'}`,
      `Payment: ${paymentId || 'Not provided'}`,
      `Amount: ${amountLabel}`,
    ].join('\n'),
    html: wrapEmail({
      eyebrow: 'New purchase',
      heading: 'New ad-free pass.',
      preview: 'A DebugTools ad-free lifetime pass was purchased.',
      body: `
        ${paragraph('A customer purchased the DebugTools ad-free lifetime pass.')}
        ${bulletList([
          `<strong>Email:</strong> ${safeEmail}`,
          `<strong>Name:</strong> ${safeName}`,
          `<strong>Payment:</strong> ${safePaymentId}`,
          `<strong>Amount:</strong> ${safeAmount}`,
        ])}
      `,
    }),
  };
}
