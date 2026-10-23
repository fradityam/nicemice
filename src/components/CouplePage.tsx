import { lazy, useEffect, useState, type ComponentType } from 'react';
import { useParams } from 'react-router-dom';
import { loadCouple } from '../invitations/couples';
import type { Invitation, TemplateId } from '../invitations/types';
import NotFoundPage from './NotFoundPage';
import { STAGE_BG } from './templates/templateStage';

/** What every template page takes: its data, and the couple's slug (none on demo pages). */
export type TemplateProps<T extends Invitation = Invitation> = { invitation: T; slug?: string };

const TEMPLATES: Record<TemplateId, ComponentType<TemplateProps<any>>> = {
  friends: lazy(() => import('./templates/FriendsTemplate')),
  lalaland: lazy(() => import('./templates/LaLaLandTemplate')),
};

/** Keeps the page out of search engines while it is open. */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

/** nicemice.id/<slug>: a couple's invitation, from src/couples/<slug>.ts. */
export default function CouplePage() {
  const { slug = '' } = useParams();
  const [loaded, setLoaded] = useState<{ slug: string; invitation: Invitation | null }>();
  useNoIndex();

  useEffect(() => {
    let cancelled = false;
    loadCouple(slug).then((invitation) => !cancelled && setLoaded({ slug, invitation }));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const invitation = loaded?.slug === slug ? loaded.invitation : undefined;

  useEffect(() => {
    if (!invitation) return;
    const prev = document.title;
    document.title = `Undangan Pernikahan ${invitation.coupleNames}`;
    return () => {
      document.title = prev;
    };
  }, [invitation]);

  if (invitation === undefined) return <div className="min-h-screen" style={{ backgroundColor: STAGE_BG }} />;
  if (invitation === null) return <NotFoundPage />;
  const Template = TEMPLATES[invitation.template];
  return <Template invitation={invitation} slug={slug} />;
}
