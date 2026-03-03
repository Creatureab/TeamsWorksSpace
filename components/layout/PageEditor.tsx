'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BlockContent } from '@/types/page';

interface PageEditorProps {
  pageId: string;
  initialContent: BlockContent[];
}

export function PageEditor({ pageId, initialContent }: PageEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(() => {
    // Very simple: join paragraph-like blocks into plain text
    return (initialContent || []).map((b) => b.content).join('\n\n');
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const blocks: BlockContent[] = value
        .split(/\n{2,}/)
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .map((chunk) => ({
          id: Math.random().toString(36).substring(2) + Date.now().toString(36),
          type: 'paragraph',
          content: chunk,
          properties: {},
        }));

      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: blocks }),
      });

      if (!response.ok) {
        throw new Error('Failed to save page');
      }

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to save page:', error);
      window.alert('Could not save page. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Document editor</span>
        <button
          type="button"
          className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing && (
        <div className="space-y-3">
          <textarea
            className="mt-1 w-full min-h-[200px] rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Write your document here..."
          />
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      )}
    </div>
  );
}

