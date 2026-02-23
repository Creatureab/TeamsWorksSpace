/**
 * Page type - maps to Project (workspace page/document)
 */
export interface Page {
  id: string;
  title: string;
  icon?: string | null;
  parentId: string | null;
  spaceId: string;
  spaceType: 'my-space' | 'team-space' | 'company-space';
  order: number;
  createdAt: string;
  updatedAt: string;
  /** Optional children for tree structure */
  children?: Page[];
}

/**
 * Space type - represents a logical grouping of pages
 */
export interface Space {
  id: string;
  name: string;
  type: 'my-space' | 'team-space' | 'company-space';
  teamId?: string | null;
}

export type SpaceType = Page['spaceType'];
