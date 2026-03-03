// ✓ FIXED: Production-ready hierarchical page route with MongoDB
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageEditor } from '@/components/layout/PageEditor';
import { pageService } from '@/lib/page-service';

interface PageParams {
    workspaceId: string;
    pageSlug: string[] | string;
}

export default async function HierarchicalPage({
    params
}: {
    params: Promise<PageParams>
}) {
    const { workspaceId, pageSlug } = await params;
    const slugSegments = (Array.isArray(pageSlug) ? pageSlug : [pageSlug])
        .filter(Boolean)
        .map((segment) => decodeURIComponent(segment));

    try {
        // Get page by path segments
        const page = await pageService.getPageByPath(workspaceId, slugSegments);

        if (!page) {
            notFound();
        }

        // Ensure serializable data when passing to Client Components
        const pageObj =
            typeof (page as unknown as { toObject?: (opts?: unknown) => unknown }).toObject ===
            "function"
                ? (page as unknown as { toObject: (opts?: unknown) => any }).toObject({
                      virtuals: false,
                  })
                : (page as any);

        const pathSegments: string[] = Array.isArray(pageObj?.path)
            ? pageObj.path.map((s: unknown) => String(s))
            : [];
        const content = Array.isArray(pageObj?.content)
            ? pageObj.content.map((block: any) => ({
                  id: String(block?.id ?? ""),
                  type: String(block?.type ?? "paragraph"),
                  content: String(block?.content ?? ""),
                  properties: block?.properties ?? {},
              }))
            : [];

        return (
            <main className="h-full w-full p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">{pageObj?.title}</h1>

                    {/* Breadcrumbs */}
                    <nav className="mb-6">
                        <ol className="flex items-center space-x-2 text-sm text-gray-500">
                            <li>
                                <Link href={`/workspace/${workspaceId}`} className="hover:text-gray-700">
                                    Workspace
                                </Link>
                            </li>
                            {pathSegments.map((segment: string, index: number) => {
                                const isLast = index === pathSegments.length - 1;
                                const href = `/workspace/${workspaceId}/page/${page.path
                                    .slice(0, index + 1)
                                    .map((s: string) => encodeURIComponent(s))
                                    .join('/')}`;

                                return (
                                    <li key={index} className="flex items-center">
                                        <span className="mx-2">/</span>
                                        {isLast ? (
                                            <span className="text-gray-900 font-medium">{segment}</span>
                                        ) : (
                                            <Link href={href} className="hover:text-gray-700">
                                                {segment}
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    </nav>

                    {pageObj?.kind === 'database' ? (
                        <div className="rounded-lg border bg-white p-4">
                            <div className="mb-3 text-sm text-gray-500">
                                Database view
                                {pageObj?.databaseConfig?.table ? ` – ${pageObj.databaseConfig.table}` : ''}
                            </div>
                            <div className="text-sm text-gray-400">
                                {/* Placeholder – wire to real data source later */}
                                This is a database page. Configure and render your project/task table here.
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="prose max-w-none">
                                {content.map((block: any) => (
                                    <div key={block.id} className="mb-4">
                                        {renderBlock(block)}
                                    </div>
                                ))}
                            </div>
                            <PageEditor pageId={String(pageObj?._id)} initialContent={content} />
                        </>
                    )}
                </div>
            </main>
        );
    } catch (error) {
        console.error('Error loading page:', error);
        notFound();
    }
}

function renderBlock(block: any) {
    switch (block.type) {
        case 'heading':
            return <h2 className="text-2xl font-bold">{block.content}</h2>;
        case 'paragraph':
            return <p>{block.content}</p>;
        case 'list':
            return (
                <ul className="list-disc pl-6">
                    <li>{block.content}</li>
                </ul>
            );
        case 'task':
            return (
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={block.properties?.completed || false}
                        readOnly
                    />
                    <span className={block.properties?.completed ? 'line-through text-gray-500' : ''}>
                        {block.content}
                    </span>
                </div>
            );
        case 'code':
            return (
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                    <code>{block.content}</code>
                </pre>
            );
        default:
            return <p>{block.content}</p>;
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<PageParams> }) {
    try {
        const resolved = await params;
        const pageSlug = Array.isArray(resolved.pageSlug) ? resolved.pageSlug : [resolved.pageSlug];
        const slugSegments = pageSlug.filter(Boolean).map((segment) => decodeURIComponent(segment));
        const page = await pageService.getPageByPath(resolved.workspaceId, slugSegments);

        return {
            title: (page as any)?.title || 'Page Not Found',
            description: (page as any)?.content?.[0]?.content?.substring(0, 160) || '',
        };
    } catch {
        return {
            title: 'Page Not Found',
            description: '',
        };
    }
}