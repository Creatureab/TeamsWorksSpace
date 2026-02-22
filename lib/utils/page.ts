import type { Page } from '@/lib/types/page';

export interface DbProject {
  _id: string;
  title: string;
  slug: string;
  parentId?: string | null;
  order?: number;
  spaceId?: string | null;
  spaceType?: string;
  icon?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  workspace: string;
}

/**
 * Convert a DB project to a Page for the client.
 */
export function projectToPage(p: DbProject, workspaceId: string): Page {
  const spaceId = p.spaceId ?? `company-space-${workspaceId}`;
  const spaceType =
    p.spaceType && ['my-space', 'team-space', 'company-space'].includes(p.spaceType)
      ? (p.spaceType as Page['spaceType'])
      : 'company-space';

  return {
    id: p._id,
    title: p.title ?? 'Untitled',
    icon: p.icon ?? null,
    parentId: p.parentId ? String(p.parentId) : null,
    spaceId,
    spaceType,
    order: p.order ?? 0,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
  };
}
