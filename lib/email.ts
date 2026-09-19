import "server-only";

export async function sendPasswordResetEmail(input: { email: string; token: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: "Reset your HUSHWORK password",
      text: `Reset your HUSHWORK password: ${appUrl}/reset-password?token=${encodeURIComponent(input.token)}\n\nThis link expires in 30 minutes.`
    })
  });
  return response.ok;
}
