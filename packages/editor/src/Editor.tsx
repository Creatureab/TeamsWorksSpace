"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Block } from './Block';
import { CommandMenu } from './CommandMenu';
import { BlockActionMenu } from './BlockActionMenu';
import { Block as BlockType, BlockType as BlockKind, EditorProps } from './types';
import { toast } from 'sonner';

export const Editor = ({ initialBlocks, onChange, pageId, workspaceId }: EditorProps) => {
    const [blocks, setBlocks] = useState<BlockType[]>(initialBlocks || [
        { id: '1', pageId, workspaceId, parentBlockId: null, type: 'h1', content: '', order: 0 },
        { id: '2', pageId, workspaceId, parentBlockId: null, type: 'text', content: '', order: 1 },
    ]);

    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
    const [commandMenu, setCommandMenu] = useState<{ position: { x: number; y: number }; blockId: string } | null>(null);
    const [actionMenu, setActionMenu] = useState<{ position: { x: number; y: number }; blockId: string } | null>(null);

    const blockRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    // Notify parent of changes
    useEffect(() => {
        onChange?.(blocks);
    }, [blocks, onChange]);

    const updateBlock = useCallback((id: string, updates: Partial<BlockType>) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    }, []);

    const addBlock = useCallback((afterId: string, type: BlockKind = 'text', content: any = '') => {
        const afterBlock = blocks.find(b => b.id === afterId);
        const newBlock: BlockType = {
            id: Math.random().toString(36).substr(2, 9),
            pageId,
            workspaceId,
            parentBlockId: afterBlock?.parentBlockId || null,
            type,
            content,
            order: (afterBlock?.order || 0) + 0.5, // Simple midpoint logic
            checked: type === 'todo' ? false : undefined
        };
        const index = blocks.findIndex(b => b.id === afterId);
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);

        // Normalize orders to keep them clean
        const normalizedBlocks = newBlocks.map((b, i) => ({ ...b, order: i }));
        setBlocks(normalizedBlocks);
        setFocusedBlockId(newBlock.id);
        return newBlock.id;
    }, [blocks, pageId, workspaceId]);

    const handleAction = (id: string, action: string, data?: any) => {
        const block = blocks.find(b => b.id === id);
        if (!block) return;

        switch (action) {
            case 'delete':
                if (blocks.length > 1) {
                    setBlocks(prev => prev.filter(b => b.id !== id));
                    toast.success('Block deleted');
                }
                break;
            case 'duplicate':
                const index = blocks.findIndex(b => b.id === id);
                const duplicatedBlock = { ...block, id: Math.random().toString(36).substr(2, 9), order: block.order + 0.5 };
                const newBlocks = [...blocks];
                newBlocks.splice(index + 1, 0, duplicatedBlock);
                setBlocks(newBlocks.map((b, i) => ({ ...b, order: i })));
                toast.success('Block duplicated');
                break;
            case 'turn-into':
                updateBlock(id, { type: data as BlockKind });
                break;
            case 'color':
                updateBlock(id, { color: { background: data } });
                break;
            case 'favorite':
                updateBlock(id, { isFavorite: !block.isFavorite });
                toast.info(block.isFavorite ? 'Removed from favorites' : 'Added to favorites');
                break;
            case 'lock':
                updateBlock(id, { isLocked: !block.isLocked });
                toast.info(block.isLocked ? 'Block unlocked' : 'Block locked');
                break;
            case 'copy-link':
                const url = `${window.location.origin}/block/${id}`;
                navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard');
                break;
            case 'ask-ai':
                toast.promise(new Promise(res => setTimeout(res, 1500)), {
                    loading: 'AI is thinking...',
                    success: 'AI generated a response (Simulation)',
                    error: 'Error contacting AI',
                });
                break;
        }
        setActionMenu(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, block: BlockType) => {
        if (block.isLocked) return;

        if (e.key === 'Enter' && !e.shiftKey) {
            if (commandMenu) return;
            e.preventDefault();
            addBlock(block.id);
        } else if (e.key === 'Backspace') {
            const selection = window.getSelection();
            const range = selection?.getRangeAt(0);

            if (range?.startOffset === 0 && range?.endOffset === 0) {
                const index = blocks.findIndex(b => b.id === block.id);
                if (index > 0) {
                    e.preventDefault();
                    const prevBlock = blocks[index - 1];
                    const currentContent = typeof block.content === 'string' ? block.content : '';
                    const prevContent = typeof prevBlock.content === 'string' ? prevBlock.content : '';

                    updateBlock(prevBlock.id, { content: prevContent + currentContent });
                    setBlocks(prev => prev.filter(b => b.id !== block.id));
                    setFocusedBlockId(prevBlock.id);
                }
            }
        } else if (e.key === 'ArrowUp') {
            const index = blocks.findIndex(b => b.id === block.id);
            if (index > 0) {
                e.preventDefault();
                setFocusedBlockId(blocks[index - 1].id);
            }
        } else if (e.key === 'ArrowDown') {
            const index = blocks.findIndex(b => b.id === block.id);
            if (index < blocks.length - 1) {
                e.preventDefault();
                setFocusedBlockId(blocks[index + 1].id);
            }
        }
    };

    const handleInput = (e: React.FormEvent<HTMLElement>, block: BlockType) => {
        const content = e.currentTarget.innerText;
        updateBlock(block.id, { content });

        if (content.endsWith('/')) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setCommandMenu({
                    position: { x: rect.left, y: rect.top },
                    blockId: block.id
                });
            }
        } else if (commandMenu && !content.includes('/')) {
            setCommandMenu(null);
        }
    };

    // Focus management
    useEffect(() => {
        if (focusedBlockId && blockRefs.current[focusedBlockId]) {
            const el = blockRefs.current[focusedBlockId];
            if (document.activeElement !== el) {
                el?.focus();
                const selection = window.getSelection();
                const range = document.createRange();
                if (el && selection) {
                    range.selectNodeContents(el);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
    }, [focusedBlockId]);

    return (
        <div className="w-full max-w-4xl mx-auto px-12 md:px-24 py-20 min-h-screen relative">
            {blocks.map((block) => (
                <Block
                    key={block.id}
                    block={block}
                    isFocused={focusedBlockId === block.id}
                    innerRef={(el) => (blockRefs.current[block.id] = el)}
                    onInput={(e) => handleInput(e, block)}
                    onKeyDown={(e) => handleKeyDown(e, block)}
                    onFocus={() => setFocusedBlockId(block.id)}
                    onAddBlock={() => addBlock(block.id)}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onOpenMenu={(e) => {
                        e.preventDefault();
                        setActionMenu({ blockId: block.id, position: { x: e.clientX, y: e.clientY } });
                    }}
                />
            ))}

            {commandMenu && (
                <CommandMenu
                    position={commandMenu.position}
                    onSelect={(type) => {
                        const block = blocks.find(b => b.id === commandMenu.blockId);
                        if (block) {
                            updateBlock(block.id, { type, content: block.content.replace(/\/$/, '') });
                            setFocusedBlockId(block.id);
                        }
                        setCommandMenu(null);
                    }}
                    onClose={() => setCommandMenu(null)}
                />
            )}

            {actionMenu && (
                <BlockActionMenu
                    block={blocks.find(b => b.id === actionMenu.blockId)!}
                    position={actionMenu.position}
                    onClose={() => setActionMenu(null)}
                    onAction={(action, data) => handleAction(actionMenu.blockId, action, data)}
                />
            )}

            <div
                className="h-64 cursor-text"
                onClick={() => {
                    const lastBlock = blocks[blocks.length - 1];
                    addBlock(lastBlock.id);
                }}
            />
        </div>
    );
};
