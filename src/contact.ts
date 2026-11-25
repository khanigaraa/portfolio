import type { Lang } from './content/types';
import { t } from './i18n';

/** A wa.me link that opens a chat with the message already typed in. */
export function whatsappUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** The opening WhatsApp message: general, or about one service. */
export function whatsappMessage(lang: Lang, serviceTitle?: string): string {
  return serviceTitle ? t('contact.waService', { service: serviceTitle }, lang) : t('contact.waGeneral', {}, lang);
}

export function mailtoUrl(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

/**
 * Copies text to the clipboard. Uses the Clipboard API, falling back to a hidden textarea
 * where it is missing or blocked (older browsers, http pages). Resolves to whether it worked.
 */
export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}
