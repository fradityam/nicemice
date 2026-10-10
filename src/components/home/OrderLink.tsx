import type { ReactNode } from 'react';
import { whatsappLink } from '../../config';
import { showOrderNotice } from './OrderNotice';

interface OrderLinkProps {
  /** Prefilled WhatsApp message. */
  message: string;
  className?: string;
  children: ReactNode;
}

/** Opens a WhatsApp chat when CONTACT_WHATSAPP is set; until then, shows a "coming soon" note. */
export default function OrderLink({ message, className, children }: OrderLinkProps) {
  const href = whatsappLink(message);
  return href ? (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <button className={className} type="button" onClick={showOrderNotice}>
      {children}
    </button>
  );
}
