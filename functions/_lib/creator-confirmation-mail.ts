/**
 * B7 server-only mail delivery contract (DORMANT).
 * No provider is configured and sending is disabled by default.
 * The caller must persist the challenge's digest and TTL atomically before sending.
 */
export type OutboundMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};
export type MailTransport = (message: OutboundMessage) => Promise<boolean>;
export type ConfirmationMailRequest = {
  recipient: string;
  creatorName: string;
  confirmationUrl: string;
  sendEnabled: boolean;
  transport?: MailTransport;
};
export type ConfirmationMailResult = "disabled" | "invalid" | "sent" | "unavailable";
const escapeHtml = (value: string) => value.replace(/&/g,"&amp;").replace(/</g,"&lt;")
  .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const validMail = (s: string) => s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export function confirmationMessage(
  recipient: string, creatorName: string, confirmationUrl: string
): OutboundMessage {
  const url = new URL(confirmationUrl);
  if (!validMail(recipient) || !creatorName || creatorName.length > 100 ||
      /[\r\n\x00-\x1f\x7f]/.test(creatorName) ||
      url.protocol !== "https:" || !["rmpworks.com","www.rmpworks.com"].includes(url.hostname) ||
      url.port || url.username || url.password || url.pathname !== "/creator/confirm-email" ||
      url.searchParams.size !== 1 || !/^[A-Za-z0-9_-]{43}$/.test(url.searchParams.get("token") || "") ||
      url.hash) throw new Error("Invalid confirmation mail input");
  const safeName = escapeHtml(creatorName);
  const safeUrl = escapeHtml(url.toString());
  return {
    to: recipient.trim().toLowerCase(),
    subject: "Conferma la tua email per ricevere la risorsa",
    text: `Hai richiesto una risorsa gratuita di ${creatorName}. Per confermare l'indirizzo email, apri questo collegamento entro 15 minuti:\n${url.toString()}\n\nSe non hai richiesto questa risorsa, ignora il messaggio. Non sei iscritto a una newsletter.`,
    html: `<!doctype html><html lang="it"><body><p>Hai richiesto una risorsa gratuita di <strong>${safeName}</strong>.</p><p><a href="${safeUrl}">Conferma il tuo indirizzo email</a> entro 15 minuti.</p><p>Se non hai fatto questa richiesta, ignora il messaggio. Nessuna iscrizione marketing automatica.</p></body></html>`
  };
}
export async function dispatchConfirmationMail(
  input: ConfirmationMailRequest
): Promise<ConfirmationMailResult> {
  if (input.sendEnabled !== true) return "disabled";
  if (!input.transport) return "unavailable";
  try {
    const message = confirmationMessage(input.recipient,input.creatorName,input.confirmationUrl);
    return await input.transport(message) === true ? "sent" : "unavailable";
  } catch {
    // Never log recipient, token or provider response here.
    return "unavailable";
  }
}
