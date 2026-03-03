// ✓ FIXED: Production-grade sidebar with real MongoDB integration
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface PageSidebarProps {
    workspaceId: string;
    teamSpaceId?: string;
    currentPageId?: string;
    hierarchy: any[]; // PageHierarchy from MongoDB
}

export function PageSidebar({
    workspaceId,
    teamSpaceId,
    currentPageId,
    hierarchy
}: PageSidebarProps) {
    return (
        <div className="w-64 border-r bg-gray-50 h-full overflow-y-auto">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-sm text-gray-700 mb-2">
                    {teamSpaceId ? 'Team Pages' : 'Workspace Pages'}
                </h2>
                <CreatePageButton
                    workspaceId={workspaceId}
                    teamSpaceId={teamSpaceId}
                    parentId={undefined}
                />
            </div>

            <div className="p-2">
                {hierarchy.map((item) => {
                    const rootId = item.page.id || item.page._id?.toString?.() || item.page._id;
                    return (
                        <PageTreeItem
                            key={rootId}
                            page={item.page}
                            childNodes={item.children}
                            currentPageId={currentPageId}
                            workspaceId={workspaceId}
                            teamSpaceId={teamSpaceId}
                            level={0}
                        />
                    );
                })}
            </div>
        </div>
    );
}

// ✓ FIXED: Simple create with page refresh (can be enhanced with optimistic updates later)
function CreatePageButton({
    workspaceId,
    teamSpaceId,
    parentId,
    size = 'default'
}: {
    workspaceId: string;
    teamSpaceId?: string;
    parentId?: string;
    size?: 'default' | 'sm';
}) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    const handleCreatePage = async (): Promise<void> => {
        const title = prompt('Page title:');
        if (!title) return;

        setIsCreating(true);

        try {
            const response = await fetch('/api/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    workspaceId,
                    teamSpaceId,
                    parentId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create page');
            }

            const { page } = await response.json();

            // Navigate to new page
            const pageUrl = teamSpaceId
                ? `/workspace/${workspaceId}/team-space/${teamSpaceId}/page/${page.path.join('/')}`
                : `/workspace/${workspaceId}/page/${page.path.join('/')}`;

            toast.success('Page created successfully');
            router.push(pageUrl);
            router.refresh(); // Refresh to show new page in sidebar

        } catch (error) {
            toast.error('Failed to create page');
            console.error('Error creating page:', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <button
            onClick={handleCreatePage}
            disabled={isCreating}
            className={`flex items-center space-x-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors ${size === 'sm' ? 'p-1' : 'p-2 w-full justify-center bg-white border rounded hover:bg-gray-50'
                }`}
        >
            <Plus className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
            {size === 'default' && (
                <span className="text-sm">
                    {isCreating ? 'Creating...' : 'New Page'}
                </span>
            )}
        </button>
    );
}

function PageTreeItem({
    page,
    childNodes,
    currentPageId,
    workspaceId,
    teamSpaceId,
    level
}: {
    page: any; // MongoDB page document
    childNodes: any[];
    currentPageId?: string;
    workspaceId: string;
    teamSpaceId?: string;
    level: number;
}) {
    const [isExpanded, setIsExpanded] = useState(level < 2);
    const [isHovered, setIsHovered] = useState(false);
    const pageId = page.id || page._id?.toString?.() || page._id;
    const isActive = pageId === currentPageId;

    const pageUrl = teamSpaceId
        ? `/workspace/${workspaceId}/team-space/${teamSpaceId}/page/${page.path.join('/')}`
        : `/workspace/${workspaceId}/page/${page.path.join('/')}`;

    return (
        <div>
            <div
                className={`group flex items-center py-1 px-2 rounded hover:bg-gray-100 transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : ''
                    }`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {childNodes.length > 0 ? (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mr-1 p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                        <ChevronRight
                            className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''
                                }`}
                        />
                    </button>
                ) : (
                    <div className="w-5" />
                )}

                <Link
                    href={pageUrl}
                    className="flex-1 truncate text-sm py-1 hover:text-blue-600 transition-colors"
                >
                    {page.title || 'Untitled'}
                </Link>

                {isHovered && (
                    <div className="flex items-center space-x-1">
                        <CreatePageButton
                            workspaceId={workspaceId}
                            teamSpaceId={teamSpaceId}
                            parentId={pageId}
                            size="sm"
                        />
                        <PageActionsMenu page={page} />
                    </div>
                )}
            </div>

            {isExpanded && childNodes.length > 0 && (
                <div>
                    {childNodes.map((child) => (
                        <PageTreeItem
                            key={child.page.id || child.page._id?.toString?.() || child.page._id}
                            page={child.page}
                            childNodes={child.children}
                            currentPageId={currentPageId}
                            workspaceId={workspaceId}
                            teamSpaceId={teamSpaceId}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function PageActionsMenu({ page }: { page: any }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (): Promise<void> => {
        if (!confirm('Are you sure you want to delete this page and all its children?')) {
            return;
        }

        setIsDeleting(true);

        try {
            const pageId = page.id || page._id?.toString?.() || page._id;
            const response = await fetch(`/api/pages/${pageId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete page');
            }

            toast.success('Page deleted successfully');
            router.refresh(); // Refresh to update sidebar
        } catch (error) {
            toast.error('Failed to delete page');
            console.error('Error deleting page:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            className="p-1 hover:bg-red-100 rounded transition-colors"
            disabled={isDeleting}
            onClick={handleDelete}
            title="Delete page"
        >
            <Trash2 className="h-3 w-3 text-red-500" />
        </button>
    );
}