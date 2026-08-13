import {
  createAdFreeConfirmationEmail,
  createPaymentIssueEmail,
  createWelcomeEmail,
  createWorkspaceInviteEmail,
} from '../email-templates';

describe('transactional email templates', () => {
  it('creates a compact welcome email for new DebugTools users', () => {
    const email = createWelcomeEmail({
      email: 'jasim@example.com',
      name: 'Jasim',
    });

    expect(email.subject).toBe('Welcome to DebugTools');
    expect(email.text).toContain('API Workbench');
    expect(email.text).toContain('local-first');
    expect(email.html).toContain('https://debugtools.org/tools/api/');
  });

  it('escapes user controlled content before rendering HTML', () => {
    const email = createWelcomeEmail({
      email: 'x@example.com',
      name: '<script>alert(1)</script>',
    });

    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('creates a clean ad-free receipt with the payment reference', () => {
    const email = createAdFreeConfirmationEmail({
      email: 'buyer@example.com',
      name: 'Buyer Person',
      paymentId: 'pay_123',
    });

    expect(email.subject).toBe('DebugTools ad-free lifetime pass is active');
    expect(email.text).toContain('$3 lifetime pass');
    expect(email.text).toContain('pay_123');
  });

  it('creates payment issue emails for failed and cancelled checkouts', () => {
    const failed = createPaymentIssueEmail({
      email: 'buyer@example.com',
      name: 'Buyer',
      status: 'failed',
    });
    const cancelled = createPaymentIssueEmail({
      email: 'buyer@example.com',
      status: 'cancelled',
    });

    expect(failed.subject).toBe('DebugTools payment did not go through');
    expect(failed.text).toContain('card was not charged');
    expect(cancelled.subject).toBe('DebugTools checkout was cancelled');
    expect(cancelled.text).toContain('DebugTools still works normally');
  });

  it('creates workspace invitation emails with the invitation URL', () => {
    const email = createWorkspaceInviteEmail({
      email: 'member@example.com',
      inviterName: 'Jasim',
      workspaceName: 'DebugTools Core',
      inviteUrl: 'https://debugtools.org/workspace/invite/abc',
    });

    expect(email.subject).toBe('Join DebugTools Core on DebugTools');
    expect(email.html).toContain('https://debugtools.org/workspace/invite/abc');
    expect(email.text).toContain('Jasim invited you');
  });
});
