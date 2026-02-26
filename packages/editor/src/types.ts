export type BlockType =
    | 'text'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'bulleted-list'
    | 'numbered-list'
    | 'todo'
    | 'toggle'
    | 'quote'
    | 'callout'
    | 'divider'
    | 'code'
    | 'image'
    | 'video'
    | 'audio'
    | 'file'
    | 'embed'
    | 'bookmark'
    | 'page'
    | 'mention'
    | 'date'
    | 'database-table'
    | 'database-board'
    | 'database-list'
    | 'database-calendar'
    | 'database-timeline'
    | 'database-gallery';

export interface Block {
    id: string;
    pageId: string;
    workspaceId: string;
    parentBlockId: string | null;
    type: BlockType;
    content?: any;
    order: number;
    checked?: boolean;
    children?: string[]; // IDs of child blocks for quick lookup
    isFavorite?: boolean;
    isLocked?: boolean;
    color?: {
        text?: string;
        background?: string;
    };
}

export interface EditorProps {
    initialBlocks?: Block[];
    onChange?: (blocks: Block[]) => void;
    placeholder?: string;
    pageId: string;
    workspaceId: string;
}
