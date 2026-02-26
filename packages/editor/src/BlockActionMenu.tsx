"use client"

import React, { useEffect, useRef, useState } from 'react';
import {
    Copy,
    Trash2,
    Link,
    MoveRight,
    Star,
    Lock,
    Palette,
    Type,
    Sparkles,
    MessageSquare,
    Heading1,
    Heading2,
    Heading3,
    List,
    CheckSquare,
    Quote,
    Code,
    ImageIcon,
    Download,
    Maximize,
    Crop,
    FileText,
    MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Block, BlockType } from './types';

interface BlockActionMenuProps {
    block: Block;
    position: { x: number; y: number };
    onClose: () => void;
    onAction: (action: string, data?: any) => void;
}

const COLORS = [
    { name: 'Default', bg: 'bg-transparent', text: 'text-inherit' },
    { name: 'Gray', bg: 'bg-gray-100', text: 'text-gray-600' },
    { name: 'Brown', bg: 'bg-stone-100', text: 'text-stone-600' },
    { name: 'Orange', bg: 'bg-orange-100', text: 'text-orange-600' },
    { name: 'Yellow', bg: 'bg-yellow-100', text: 'text-yellow-600' },
    { name: 'Green', bg: 'bg-green-100', text: 'text-green-600' },
    { name: 'Blue', bg: 'bg-blue-100', text: 'text-blue-600' },
    { name: 'Purple', bg: 'bg-purple-100', text: 'text-purple-600' },
    { name: 'Pink', bg: 'bg-pink-100', text: 'text-pink-600' },
    { name: 'Red', bg: 'bg-red-100', text: 'text-red-600' },
];

export const BlockActionMenu = ({ block, position, onClose, onAction }: BlockActionMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const MenuItem = ({ icon: Icon, label, action, shortcut, danger, hasSubmenu }: any) => (
        <button
            onClick={() => !hasSubmenu && onAction(action)}
            onMouseEnter={() => setActiveSubmenu(hasSubmenu ? action : null)}
            className={cn(
                "w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors",
                danger ? "hover:bg-red-50 text-red-600" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
            )}
        >
            <div className="flex items-center gap-2">
                <Icon size={16} />
                <span>{label}</span>
            </div>
            {shortcut && <span className="text-[10px] text-gray-400 font-mono">{shortcut}</span>}
            {hasSubmenu && <ChevronRight size={14} className="text-gray-400" />}
        </button>
    );

    const isImage = block.type === 'image';

    return (
        <div
            ref={menuRef}
            className="fixed z-[100] w-64 bg-white dark:bg-[#1f1f1f] rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 p-1.5 animate-in fade-in zoom-in duration-200"
            style={{
                top: Math.min(position.y, window.innerHeight - 400),
                left: Math.min(position.x + 20, window.innerWidth - 280)
            }}
        >
            {/* AI Action */}
            <div className="px-1 py-1">
                <button
                    onClick={() => onAction('ask-ai')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                    <Sparkles size={16} />
                    <span>Ask AI</span>
                </button>
            </div>

            <div className="h-[1px] bg-gray-100 dark:bg-gray-800 my-1" />

            {/* Contextual Actions */}
            {isImage && (
                <>
                    <MenuItem icon={ImageIcon} label="Replace" action="replace" />
                    <MenuItem icon={Maximize} label="Full width" action="full-width" />
                    <MenuItem icon={Download} label="Download" action="download" />
                    <MenuItem icon={Crop} label="Crop image" action="crop" />
                    <div className="h-[1px] bg-gray-100 dark:bg-gray-800 my-1" />
                </>
            )}

            {/* General Actions */}
            <MenuItem icon={Trash2} label="Delete" action="delete" shortcut="Del" danger />
            <MenuItem icon={Copy} label="Duplicate" action="duplicate" shortcut="Ctrl+D" />
            <MenuItem icon={Link} label="Copy link" action="copy-link" />
            <MenuItem icon={MoveRight} label="Move to" action="move-to" />

            <div className="h-[1px] bg-gray-100 dark:bg-gray-800 my-1" />

            <MenuItem icon={MessageSquare} label="Comment" action="comment" shortcut="Ctrl+Shift+M" />
            <MenuItem icon={Star} label="Add to favorites" action="favorite" />
            <MenuItem icon={Lock} label="Lock" action="lock" />

            {/* Turn into (Simulated Submenu) */}
            <div className="px-1 py-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase px-3 py-1">Turn into</div>
                <div className="grid grid-cols-4 gap-1 p-1">
                    <button onClick={() => onAction('turn-into', 'text')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md" title="Text"><Type size={16} /></button>
                    <button onClick={() => onAction('turn-into', 'h1')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md" title="H1"><Heading1 size={16} /></button>
                    <button onClick={() => onAction('turn-into', 'h2')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md" title="H2"><Heading2 size={16} /></button>
                    <button onClick={() => onAction('turn-into', 'todo')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md" title="Todo"><CheckSquare size={16} /></button>
                </div>
            </div>

            <div className="h-[1px] bg-gray-100 dark:bg-gray-800 my-1" />

            {/* Colors */}
            <div className="px-1 py-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase px-3 py-1 flex items-center gap-1">
                    <Palette size={10} /> Color
                </div>
                <div className="flex flex-wrap gap-1 p-1">
                    {COLORS.slice(0, 5).map(c => (
                        <button
                            key={c.name}
                            onClick={() => onAction('color', c.bg)}
                            className={cn("w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform", c.bg)}
                            title={c.name}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ChevronRight = ({ size, className }: any) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        strokeLinejoin="round" className={className}
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
);
