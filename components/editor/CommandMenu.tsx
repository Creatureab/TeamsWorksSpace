"use client"

import React, { useEffect, useState, useRef } from 'react';
import {
    Type, Heading1, Heading2, Heading3, List, MessageSquare,
    Minus, CheckSquare, ListOrdered, Quote, ChevronRight, Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockType } from './types';

interface CommandMenuProps {
    position: { x: number; y: number };
    onSelect: (type: BlockType) => void;
    onClose: () => void;
}

const COMMANDS: { type: BlockType; label: string; icon: any; description: string }[] = [
    { type: 'text', label: 'Text', icon: Type, description: 'Just start writing with plain text.' },
    { type: 'h1', label: 'Heading 1', icon: Heading1, description: 'Big section heading.' },
    { type: 'h2', label: 'Heading 2', icon: Heading2, description: 'Medium section heading.' },
    { type: 'h3', label: 'Heading 3', icon: Heading3, description: 'Small section heading.' },
    { type: 'todo', label: 'To-do list', icon: CheckSquare, description: 'Track tasks with a todo list.' },
    { type: 'bulleted-list', label: 'Bulleted list', icon: List, description: 'Create a simple bulleted list.' },
    { type: 'numbered-list', label: 'Numbered list', icon: ListOrdered, description: 'Create a list with numbering.' },
    { type: 'toggle', label: 'Toggle list', icon: ChevronRight, description: 'Toggles can hide content inside.' },
    { type: 'quote', label: 'Quote', icon: Quote, description: 'Capture a quotation.' },
    { type: 'callout', label: 'Callout', icon: MessageSquare, description: 'Make writing stand out.' },
    { type: 'divider', label: 'Divider', icon: Minus, description: 'Visually divide your content.' },
    { type: 'code', label: 'Code', icon: Code, description: 'Add a code snippet.' },
];

export const CommandMenu = ({ position, onSelect, onClose }: CommandMenuProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % COMMANDS.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + COMMANDS.length) % COMMANDS.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                onSelect(COMMANDS[selectedIndex].type);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, onSelect, onClose]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed z-50 w-72 bg-white dark:bg-[#202020] rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 p-1 flex flex-col max-h-80 overflow-y-auto"
            style={{
                top: Math.min(position.y + 24, window.innerHeight - 300), // Basic overflow protection
                left: Math.min(position.x, window.innerWidth - 300)
            }}
        >
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Basic blocks
            </div>
            {COMMANDS.map((cmd, i) => (
                <button
                    key={cmd.type}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                        i === selectedIndex ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    )}
                    onClick={() => onSelect(cmd.type)}
                    onMouseEnter={() => setSelectedIndex(i)}
                >
                    <div className="flex-shrink-0 w-8 h-8 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center bg-white dark:bg-gray-900 shadow-sm">
                        <cmd.icon size={18} className="text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cmd.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{cmd.description}</span>
                    </div>
                </button>
            ))}
        </div>
    );
};
