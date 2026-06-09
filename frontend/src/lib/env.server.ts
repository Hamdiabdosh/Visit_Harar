const PLACEHOLDER_PATTERNS = [
  /^re_your/i,
  /your-api-key/i,
  /your-production-secret/i,
  /your-32-char/i,
  /change-this-immediately/i,
  /change-me-before-production/i,
];

/** True when a secret env var is set to a real value (not empty or a template placeholder). */
export function isConfiguredSecret(
  value: string | undefined | null,
): value is string {
  if (!value?.trim()) return false;
  return !PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

export function getResendConfig(): { apiKey: string; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!isConfiguredSecret(apiKey) || !from) return null;
  return { apiKey, from };
}
