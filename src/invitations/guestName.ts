import { useSearchParams } from 'react-router-dom';
import { guestNameFromSearch } from './guestNameText';

export { guestNameFromSearch };

/** The guest's name for the cover: from ?to=, or `fallback` when the link has none. */
export function useGuestName(fallback: string): string {
  const [search] = useSearchParams();
  return guestNameFromSearch(search) ?? fallback;
}
