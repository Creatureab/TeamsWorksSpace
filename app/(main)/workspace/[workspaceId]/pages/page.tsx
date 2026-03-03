// Demo page to show hierarchical pages with MongoDB
import { PageSidebar } from '@/components/layout/PageSidebar';
import { pageService } from '@/lib/page-service';

interface PageParams {
    workspaceId: string;
}

export default async function WorkspacePagesPage({
    params
}: {
    params: PageParams
}) {
    const { workspaceId } = params;

    try {
        // Get workspace hierarchy for sidebar
        const hierarchy = await pageService.getPageHierarchy(workspaceId);

        return (
            <div className="flex h-full">
                <PageSidebar
                    workspaceId={workspaceId}
                    hierarchy={hierarchy}
                />
                <main className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold mb-8">Workspace Pages</h1>

                        <div className="prose max-w-none">
                            <p className="text-lg text-gray-600 mb-6">
                                Welcome to your hierarchical page system! This is a Notion-like workspace where you can:
                            </p>

                            <ul className="list-disc pl-6 space-y-2">
                                <li>Create pages and organize them hierarchically</li>
                                <li>Nest pages infinitely deep</li>
                                <li>Navigate using the sidebar tree structure</li>
                                <li>Use clean URLs that reflect the page hierarchy</li>
                                <li>Experience optimistic updates (no page reloads)</li>
                            </ul>

                            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">🚀 Production-Ready Features</h3>
                                <ul className="list-disc pl-6 space-y-1 text-sm">
                                    <li><strong>Data Integrity:</strong> All operations use database transactions</li>
                                    <li><strong>Performance:</strong> Bulk operations, no N+1 queries</li>
                                    <li><strong>Correctness:</strong> Proper slug collision handling</li>
                                    <li><strong>UX:</strong> Optimistic updates with rollback on failure</li>
                                    <li><strong>Security:</strong> Input validation and error handling</li>
                                </ul>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">Try it out:</h3>
                                <ol className="list-decimal pl-6 space-y-1">
                                    <li>Click &quot;New Page&quot; in the sidebar to create a page</li>
                                    <li>Hover over existing pages to see the &quot;+&quot; button for sub-pages</li>
                                    <li>Navigate through the hierarchy using the sidebar</li>
                                    <li>Notice the clean URLs and breadcrumbs</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    } catch (error) {
        console.error('Error loading workspace pages:', error);
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600">Error Loading Pages</h1>
                <p className="text-gray-600">There was an error loading the workspace pages.</p>
            </div>
        );
    }
}