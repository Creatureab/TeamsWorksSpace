import type { Page } from '@/lib/types/page';

/**
 * Build a nested tree from a flat array of pages, filtered by spaceId.
 * Sorted by order, then createdAt.
 */
export function buildTree(pages: Page[], spaceId: string): Page[] {
  const filtered = pages
    .filter((p) => p.spaceId === spaceId)
    .sort((a, b) => a.order - b.order || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const byId = new Map<string, Page>();
  filtered.forEach((p) => {
    byId.set(p.id, { ...p, children: [] });
  });

  const roots: Page[] = [];

  filtered.forEach((p) => {
    const node = byId.get(p.id)!;
    if (!p.parentId || p.parentId === '' || p.parentId === null) {
      roots.push(node);
    } else {
      const parent = byId.get(p.parentId);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  });

  // Sort children within each node
  function sortChildren(nodes: Page[]) {
    nodes.sort((a, b) => a.order - b.order || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    nodes.forEach((n) => n.children?.length && sortChildren(n.children));
  }
  sortChildren(roots);

  return roots;
}

/**
 * Flatten a nested tree back to a flat array (depth-first).
 */
export function flattenTree(tree: Page[]): Page[] {
  const result: Page[] = [];
  function traverse(nodes: Page[]) {
    nodes.forEach((node) => {
      const { children, ...rest } = node;
      result.push({ ...rest, children: undefined });
      if (children?.length) traverse(children);
    });
  }
  traverse(tree);
  return result;
}

/**
 * Get all descendant IDs of a page (for drag-drop validation).
 */
export function getDescendantIds(pages: Page[], pageId: string): Set<string> {
  const byId = new Map<string, Page>();
  pages.forEach((p) => byId.set(p.id, p));

  const descendants = new Set<string>();
  function collect(id: string) {
    pages
      .filter((p) => String(p.parentId ?? '') === id)
      .forEach((child) => {
        descendants.add(child.id);
        collect(child.id);
      });
  }
  collect(pageId);
  return descendants;
}
