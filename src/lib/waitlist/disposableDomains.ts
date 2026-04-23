const DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","tempmail.org","tempmail.com","10minutemail.com",
  "throwawaymail.com","yopmail.com","getairmail.com","fakeinbox.com","trashmail.com",
  "maildrop.cc","dispostable.com","mintemail.com","sharklasers.com","spam4.me",
  "temp-mail.org","tempr.email","mytemp.email","moakt.com","mohmal.com",
  "tmpmail.org","burnermail.io","getnada.com","inboxbear.com","emailondeck.com",
  "fakemail.net","fakemailgenerator.com","spambox.us","mailsac.com","mailcatch.com",
]);

export function isDisposableEmail(email: string): boolean {
  const lower = email.trim().toLowerCase();
  const at = lower.lastIndexOf("@");
  if (at <= 0 || at === lower.length - 1) return true;
  const domain = lower.slice(at + 1);
  return DOMAINS.has(domain);
}
