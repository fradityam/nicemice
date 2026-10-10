import type { ReactNode } from 'react';
import { ORDER_FALLBACK_HREF, whatsappLink } from '../../config';

interface OrderLinkProps {
  /** Prefilled WhatsApp message. */
  message: string;
  className?: string;
  children: ReactNode;
}

/** Opens a WhatsApp chat when CONTACT_WHATSAPP is set; until then, scrolls to the catalog. */
export default function OrderLink({ message, className, children }: OrderLinkProps) {
  const href = whatsappLink(message);
  return href ? (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <a className={className} href={ORDER_FALLBACK_HREF}>
      {children}
    </a>
  );
}
