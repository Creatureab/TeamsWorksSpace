"use client"

import { Editor } from '@/components/editor/Editor';
import { Block } from '@/components/editor/types';
import { useState, useEffect, useCallback } from 'react';
import {
    ImageIcon,
    MoreHorizontal,
    User as UserIcon,
    Calendar,
    CircleDashed,
    Layout,
    Plus,
    Loader2
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { getBlocks, saveBlocks } from '@/lib/actions/blocks';
import { toast } from 'sonner';

interface TaskProps {
    user: any;
    project: any;
    currentWorkspace: any;
}

const Task = ({ user, project, currentWorkspace }: TaskProps) => {
    const params = useParams();
    const pageId = Array.isArray(params.id) ? params.id[0] : (project?.slug || 'default-page');
    const workspaceId = currentWorkspace?._id || 'default-workspace';

    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load blocks from DB on mount
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            const data = await getBlocks(pageId);
            if (data && data.length > 0) {
                setBlocks(data);
            } else {
                // Default blocks if DB is empty
                setBlocks([
                    { id: '1', pageId, workspaceId, parentBlockId: null, order: 0, type: 'h1', content: project?.title || 'Untitled Page' },
                    { id: '2', pageId, workspaceId, parentBlockId: null, order: 1, type: 'callout', content: '💡 Welcome to your new page! Everything you type here is now automatically saved to the database.' },
                ]);
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, [pageId, project?.title, workspaceId]);

    // Auto-save logic with debounce
    useEffect(() => {
        if (isLoading || blocks.length === 0) return;

        const timer = setTimeout(async () => {
            setIsSaving(true);
            const result = await saveBlocks(pageId, workspaceId, blocks);
            if (!result.success) {
                toast.error("Failed to auto-save changes");
            }
            setIsSaving(false);
        }, 1500); // 1.5s debounce

        return () => clearTimeout(timer);
    }, [blocks, pageId, workspaceId, isLoading]);

    const handleEditorChange = (updatedBlocks: Block[]) => {
        setBlocks(updatedBlocks);
    };

    if (isLoading) {
        return (
            <div className="flex-1 h-full flex items-center justify-center bg-white dark:bg-[#191919]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex-1 h-full bg-white dark:bg-[#191919] overflow-y-auto overflow-x-hidden selection:bg-blue-100 dark:selection:bg-blue-900/40 pb-32">
            {/* Auto-save Indicator */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                {isSaving ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
                        <Loader2 size={12} className="animate-spin" />
                        Saving...
                    </div>
                ) : (
                    <div className="px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 text-xs font-medium">
                        Saved
                    </div>
                )}
            </div>

            {/* Project Header Area (Cover) */}
            <div className="w-full h-[30vh] group relative bg-gray-50 dark:bg-gray-900/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-[#191919] opacity-40" />

                {/* Header Controls */}
                <div className="absolute bottom-4 right-12 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <ImageIcon size={14} />
                        Change cover
                    </button>
                    <button className="p-1.5 rounded-md bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto px-12 md:px-24 -mt-12 relative z-10">
                {/* Page Icon */}
                <div className="w-max mb-2 group/icon flex flex-col pt-4 font-noto">
                    <div className="text-7xl hover:scale-105 transition-transform cursor-pointer select-none">
                        📄
                    </div>
                </div>

                {/* Standard Notion Page Header */}
                <div className="space-y-1 mt-4">
                    <h1 className="text-4xl font-bold text-[#37352f] dark:text-gray-100 outline-none w-full break-words">
                        {project?.title || 'Untitled Page'}
                    </h1>
                </div>

                {/* PROPERTIES SECTION */}
                <div className="mt-8 mb-4 space-y-1">
                    <div className="grid grid-cols-[140px_1fr] group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-sm py-1.5 px-2 -mx-2 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                            <UserIcon size={16} />
                            <span>Assignee</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-sm dark:text-gray-200">{user?.name || 'Unassigned'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-[140px_1fr] group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-sm py-1.5 px-2 -mx-2 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                            <CircleDashed size={16} />
                            <span>Status</span>
                        </div>
                        <div className="flex items-center">
                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                Under review
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-[140px_1fr] group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-sm py-1.5 px-2 -mx-2 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                            <Calendar size={16} />
                            <span>Due</span>
                        </div>
                        <div className="flex items-center text-sm dark:text-gray-200">
                            Oct 24, 2023
                        </div>
                    </div>

                    <div className="grid grid-cols-[140px_1fr] group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-sm py-1.5 px-2 -mx-2 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                            <Layout size={16} />
                            <span>Project</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm dark:text-blue-400 text-blue-600 hover:underline flex items-center gap-1.5">
                                <div className="p-0.5 rounded bg-blue-50 dark:bg-blue-900/20">
                                    <Layout size={12} />
                                </div>
                                {project?.title || 'Lawgistics'}
                            </span>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 -mx-2 rounded-sm transition-colors mt-2">
                        <Plus size={16} />
                        <span>Add property</span>
                    </button>
                </div>

                <div className="h-[1px] bg-gray-200 dark:bg-gray-800 w-full mb-8" />

                {/* THE EDITOR */}
                <div className="-mx-12 md:-mx-24">
                    <Editor
                        initialBlocks={blocks}
                        onChange={handleEditorChange}
                        pageId={pageId}
                        workspaceId={workspaceId}
                    />
                </div>
            </div>
        </div>
    );
};

export default Task;