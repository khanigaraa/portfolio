import { describe, expect, it } from 'vitest';
import { mailtoUrl, whatsappMessage, whatsappUrl } from './contact';

describe('contact links', () => {
  it('builds a WhatsApp link with the message encoded', () => {
    expect(whatsappUrl('6281234567890', 'Halo Kanta, aku tertarik & mau tanya?')).toBe(
      'https://wa.me/6281234567890?text=Halo%20Kanta%2C%20aku%20tertarik%20%26%20mau%20tanya%3F',
    );
  });

  it('writes the opening message per language, naming the service', () => {
    expect(whatsappMessage('id')).toBe('Halo Kanta, aku lihat portofoliomu dan ingin ngobrol.');
    expect(whatsappMessage('en')).toBe('Hi Kanta, I saw your portfolio and would like to talk.');
    expect(whatsappMessage('id', 'Olah Data & Excel')).toBe(
      'Halo Kanta, aku lihat portofoliomu dan tertarik dengan layanan "Olah Data & Excel". Boleh ngobrol soal kebutuhanku?',
    );
    expect(whatsappMessage('en', 'Data & Spreadsheet Work')).toBe(
      'Hi Kanta, I saw your portfolio and I am interested in "Data & Spreadsheet Work". Could we talk about what I need?',
    );
  });

  it('builds a mailto link with a subject', () => {
    expect(mailtoUrl('kanta@example.com', 'Halo dari portofolio')).toBe(
      'mailto:kanta@example.com?subject=Halo%20dari%20portofolio',
    );
  });
});
