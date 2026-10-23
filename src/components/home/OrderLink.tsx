import type { ReactNode } from 'react';
import { track, type WhatsAppButton } from '../../analytics';
import { whatsappLink } from '../../config';
import { showOrderNotice } from './OrderNotice';

interface OrderLinkProps {
  /** Prefilled WhatsApp message. */
  message: string;
  /** Which button this is, for Analytics (whatsapp_click). */
  button: WhatsAppButton;
  /** The catalog card's theme, for Analytics. */
  theme?: string;
  className?: string;
  children: ReactNode;
}

/** Opens a WhatsApp chat when CONTACT_WHATSAPP is set; until then, shows a "coming soon" note. */
export default function OrderLink({ message, button, theme, className, children }: OrderLinkProps) {
  const href = whatsappLink(message);
  return href ? (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('whatsapp_click', { button, ...(theme && { theme }) })}
    >
      {children}
    </a>
  ) : (
    <button className={className} type="button" onClick={showOrderNotice}>
      {children}
    </button>
  );
}
