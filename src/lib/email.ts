import { Resend } from 'resend';
import {
  TransactionalEmail,
  createAdFreeAdminEmail,
  createAdFreeConfirmationEmail,
  createPaymentIssueEmail,
  createWelcomeEmail,
  createWorkspaceInviteEmail,
} from '@/lib/email-templates';

type AdFreeEmailInput = {
  email: string;
  name?: string | null;
  paymentId?: string | null;
};

type WelcomeEmailInput = {
  email: string;
  name?: string | null;
};

type PaymentIssueEmailInput = {
  email: string;
  name?: string | null;
  status: 'failed' | 'cancelled';
  paymentId?: string | null;
};

type WorkspaceInviteEmailInput = {
  email: string;
  name?: string | null;
  inviterName?: string | null;
  workspaceName: string;
  inviteUrl: string;
};

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || 'DebugTools <support@debugtools.org>';
}

async function sendTransactionalEmail({
  to,
  email,
  idempotencyKey,
  label,
}: {
  to: string;
  email: TransactionalEmail;
  idempotencyKey?: string;
  label: string;
}) {
  const resend = getResendClient();

  if (!resend) {
    console.info(`Resend is not configured; skipped ${label} email.`);
    return { skipped: true };
  }

  return resend.emails.send(
    {
      from: getFromEmail(),
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    },
    idempotencyKey ? { idempotencyKey } : undefined
  );
}

export async function sendWelcomeEmail({ email, name }: WelcomeEmailInput) {
  return sendTransactionalEmail({
    to: email,
    label: 'welcome',
    email: createWelcomeEmail({ email, name }),
    idempotencyKey: `welcome-${email.toLowerCase()}`,
  });
}

export async function sendAdFreeConfirmationEmail({
  email,
  name,
  paymentId,
}: AdFreeEmailInput) {
  return sendTransactionalEmail({
    to: email,
    label: 'ad-free confirmation',
    email: createAdFreeConfirmationEmail({ email, name, paymentId }),
    idempotencyKey: paymentId ? `ad-free-confirmation-${paymentId}` : `ad-free-confirmation-${email.toLowerCase()}`,
  });
}

export async function sendAdFreeAdminEmail({
  email,
  name,
  paymentId,
}: AdFreeEmailInput) {
  const notifyEmail = process.env.AD_FREE_NOTIFY_EMAIL || process.env.RESEND_NOTIFY_EMAIL;

  if (!notifyEmail) {
    return { skipped: true };
  }

  return sendTransactionalEmail({
    to: notifyEmail,
    label: 'ad-free admin notification',
    email: createAdFreeAdminEmail({ email, name, paymentId }),
    idempotencyKey: paymentId ? `ad-free-admin-${paymentId}` : undefined,
  });
}

export async function sendPaymentIssueEmail({
  email,
  name,
  status,
  paymentId,
}: PaymentIssueEmailInput) {
  return sendTransactionalEmail({
    to: email,
    label: `${status} payment`,
    email: createPaymentIssueEmail({ email, name, status }),
    idempotencyKey: paymentId ? `payment-${status}-${paymentId}` : `payment-${status}-${email.toLowerCase()}`,
  });
}

export async function sendWorkspaceInviteEmail({
  email,
  name,
  inviterName,
  workspaceName,
  inviteUrl,
}: WorkspaceInviteEmailInput) {
  return sendTransactionalEmail({
    to: email,
    label: 'workspace invite',
    email: createWorkspaceInviteEmail({ email, name, inviterName, workspaceName, inviteUrl }),
    idempotencyKey: `workspace-invite-${workspaceName.toLowerCase()}-${email.toLowerCase()}`,
  });
}
