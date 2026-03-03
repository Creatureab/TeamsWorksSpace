// Production-ready page types with all fixes applied
export interface Page {
    id?: string;               // For compatibility with different DB systems
    _id?: { toString(): string }; // MongoDB ObjectId compatibility
    title: string;
    slug: string;              // URL-safe, unique within parent
    content: BlockContent[];

    // Hierarchy (conscious denormalization for read performance)
    parentId?: string | null;  // Source of truth
    path: string[];            // DERIVED - for fast URL lookups (read-heavy workload)
    level: number;             // DERIVED - always path.length
    order: number;             // For sorting within parent

    // Context
    workspaceId: string;
    teamSpaceId?: string | null;

    // Kind / behavior
    kind?: 'doc' | 'database' | 'project';
    databaseConfig?: {
        table: 'projects' | 'tasks' | 'custom';
        viewType?: 'table' | 'board' | 'calendar';
        filters?: Record<string, any>;
        sorts?: Record<string, 'asc' | 'desc'>;
    } | null;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

export interface BlockContent {
    id: string;
    type: 'paragraph' | 'heading' | 'list' | 'task' | 'code' | 'image';
    content: string;
    properties?: Record<string, any>;
    children?: BlockContent[];
}

export interface PageHierarchy {
    page: Page;
    children: PageHierarchy[];
    hasChildren: boolean;
}

export interface CreatePageData {
    title: string;
    workspaceId: string;
    teamSpaceId?: string;
    parentId?: string;
    content?: BlockContent[];
    createdBy: string; // Added this field
    kind?: 'doc' | 'database' | 'project';
    databaseConfig?: Page['databaseConfig'];
}

export interface UpdatePageData {
    title?: string;
    content?: BlockContent[];
    kind?: 'doc' | 'database' | 'project';
    databaseConfig?: Page['databaseConfig'] | null;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}