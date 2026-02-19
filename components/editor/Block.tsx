"use client"

import React, { useState } from 'react';
import { Plus, GripVertical, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Block as BlockType } from './types';

interface BlockProps {
    block: BlockType;
    isFocused: boolean;
    innerRef: (el: HTMLElement | null) => void;
    onInput: (e: React.FormEvent<HTMLElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
    onFocus: () => void;
    onAddBlock: () => void;
    onUpdate: (updates: Partial<BlockType>) => void;
    onOpenMenu: (e: React.MouseEvent) => void;
}

export const Block = ({
    block,
    isFocused,
    innerRef,
    onInput,
    onKeyDown,
    onFocus,
    onAddBlock,
    onUpdate,
    onOpenMenu
}: BlockProps) => {
    // commonProps ensures consistent behavior and fixes the "spacing" issue using whitespace-pre-wrap
    const commonProps = {
        ref: innerRef as any,
        contentEditable: true,
        suppressContentEditableWarning: true,
        onInput: onInput as any,
        onKeyDown: onKeyDown as any,
        onFocus,
        className: cn(
            "outline-none w-full break-words whitespace-pre-wrap transition-all duration-200 rounded-md p-1",
            block.color?.background,
            block.color?.text
        ),
    };

    const renderContent = () => {
        const contentStr = typeof block.content === 'string' ? block.content : '';

        switch (block.type) {
            case 'h1':
                return <h1 {...commonProps} className={cn(commonProps.className, "text-4xl font-bold mt-8 mb-4 tracking-tight text-[#37352f] dark:text-gray-100")} data-placeholder="Heading 1">{contentStr}</h1>;
            case 'h2':
                return <h2 {...commonProps} className={cn(commonProps.className, "text-3xl font-bold mt-6 mb-3 tracking-tight text-[#37352f] dark:text-gray-100")} data-placeholder="Heading 2">{contentStr}</h2>;
            case 'h3':
                return <h3 {...commonProps} className={cn(commonProps.className, "text-2xl font-bold mt-4 mb-2 tracking-tight text-[#37352f] dark:text-gray-100")} data-placeholder="Heading 3">{contentStr}</h3>;
            case 'text':
                return (
                    <div
                        {...commonProps}
                        className={cn(commonProps.className, "text-[16px] leading-[1.6] py-[3px] min-h-[1.6em] text-[#37352f] dark:text-gray-200")}
                        data-placeholder="Type '/' for commands..."
                    >{contentStr}</div>
                );
            case 'todo':
                return (
                    <div className="flex gap-2 items-start py-[3px]">
                        <div className="mt-[6px] flex items-center justify-center w-[18px] h-[18px] flex-shrink-0">
                            <input
                                type="checkbox"
                                checked={!!block.checked}
                                onChange={(e) => onUpdate({ checked: e.target.checked })}
                                className="w-4 h-4 rounded-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 accent-blue-500 cursor-pointer"
                            />
                        </div>
                        <div
                            {...commonProps}
                            className={cn(
                                commonProps.className,
                                "text-[16px] dark:text-gray-200 transition-colors duration-200",
                                block.checked && "text-gray-400 dark:text-gray-500 line-through"
                            )}
                        >{contentStr}</div>
                    </div>
                );
            case 'bulleted-list':
                return (
                    <div className="flex gap-2 items-start py-[3px]">
                        <div className="mt-[10px] w-[6px] h-[6px] rounded-full bg-gray-900 dark:bg-gray-400 flex-shrink-0 mx-[5px]" />
                        <div {...commonProps} className={cn(commonProps.className, "text-[16px] dark:text-gray-200")}>{contentStr}</div>
                    </div>
                );
            case 'numbered-list':
                return (
                    <div className="flex gap-2 items-start py-[3px]">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mt-[6px] w-[18px] text-right flex-shrink-0 select-none">1.</div>
                        <div {...commonProps} className={cn(commonProps.className, "text-[16px] dark:text-gray-200")}>{contentStr}</div>
                    </div>
                );
            case 'toggle':
                return (
                    <div className="flex flex-col gap-1 py-[3px]">
                        <div className="flex gap-1 items-start">
                            <div className="mt-[6px] w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-400">
                                <ChevronRight size={18} />
                            </div>
                            <div {...commonProps} className={cn(commonProps.className, "text-[16px] font-medium dark:text-gray-100")}>{contentStr}</div>
                        </div>
                    </div>
                );
            case 'quote':
                return (
                    <div className="flex gap-3 py-1 my-2 border-l-4 border-gray-300 dark:border-gray-700 pl-4">
                        <div {...commonProps} className={cn(commonProps.className, "text-lg italic text-[#37352f] dark:text-gray-200")}>{contentStr}</div>
                    </div>
                );
            case 'code':
                return (
                    <div className="my-4 relative group/code bg-gray-50 dark:bg-[#202020] rounded-md p-4 pt-10 border border-gray-200 dark:border-gray-800">
                        <div className="absolute top-2 left-4 text-[10px] font-mono text-gray-400 select-none uppercase tracking-widest font-bold">Code</div>
                        <pre className="font-mono text-sm">
                            <code {...commonProps} className={cn(commonProps.className, "text-gray-700 dark:text-gray-300")}>{contentStr}</code>
                        </pre>
                    </div>
                );
            case 'divider':
                return (
                    <div className="py-4 w-full" onFocus={onFocus} tabIndex={0} onKeyDown={onKeyDown} ref={innerRef as any}>
                        <hr className="border-t border-gray-200 dark:border-gray-800" />
                    </div>
                );
            case 'callout':
                return (
                    <div className="flex gap-3 p-4 bg-gray-50 dark:bg-[#252525] rounded-md border border-gray-100 dark:border-gray-800 my-2">
                        <div className="flex-shrink-0 mt-1 select-none text-xl">💡</div>
                        <div {...commonProps} className={cn(commonProps.className, "text-[16px] leading-relaxed dark:text-gray-200")}>{contentStr}</div>
                    </div>
                );
            case 'image':
                return (
                    <div className="my-6 group/image relative">
                        {block.content ? (
                            <img src={block.content} className="max-w-full rounded-md border border-gray-200 dark:border-gray-800 shadow-sm" alt="Content" />
                        ) : (
                            <div className="bg-gray-100 dark:bg-gray-800 aspect-video rounded-md flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 group-hover/image:border-blue-400 transition-colors">
                                <span className="text-gray-400 mb-2 font-medium">Image block</span>
                                <div
                                    {...commonProps}
                                    className="text-xs text-blue-500 underline text-center opacity-0 group-hover/image:opacity-100 cursor-text"
                                    data-placeholder="Paste an image URL here..."
                                />
                            </div>
                        )}
                    </div>
                );
            case 'database-table':
                return (
                    <div className="my-8 p-6 bg-white dark:bg-[#191919] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <span className="text-blue-600 text-[10px] font-bold">DB</span>
                            </div>
                            <h4 className="font-bold text-[#37352f] dark:text-gray-100">Database Table</h4>
                        </div>
                        <div className="border border-gray-100 dark:border-gray-800 rounded">
                            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800/50 p-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 dark:border-gray-800">
                                <div>Name</div>
                                <div>Status</div>
                                <div>Date</div>
                            </div>
                            <div className="p-12 text-center text-sm text-gray-400 italic">
                                Table rendering system coming soon...
                            </div>
                        </div>
                        <div {...commonProps} className="hidden" />
                    </div>
                );
            default:
                return (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500 text-center my-2 italic">
                        Unimplemented block type: {block.type}
                    </div>
                );
        }
    };

    return (
        <div
            className={cn(
                "group relative flex items-start gap-1 mb-[2px] rounded-md transition-all duration-200",
                block.isLocked && "opacity-80 grayscale-[0.2]"
            )}
        >
            {/* Hover controls */}
            {!block.isLocked && (
                <div className="absolute -left-12 top-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-full max-h-8">
                    <button
                        onClick={onAddBlock}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                        title="Quick add"
                    >
                        <Plus size={16} className="text-gray-400" />
                    </button>
                    <div
                        onClick={onOpenMenu}
                        className="p-1 cursor-grab hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors active:cursor-grabbing"
                        title="Drag to reorder or click for menu"
                    >
                        <GripVertical size={16} className="text-gray-400" />
                    </div>
                </div>
            )}

            <div className="w-full">
                {renderContent()}
            </div>
        </div>
    );
};
