// Database abstraction layer using real MongoDB connection
import dbConnect from '@/lib/mongodb';
import { Page } from '@/models/Page';
import mongoose from 'mongoose';

export interface PageQuery {
    where?: {
        workspaceId?: string;
        teamSpaceId?: string | null;
        parentId?: string | null;
        slug?: string;
        path?: { equals: string[] };
        id?: { in: string[] };
        _id?: { $in: string[] };
    };
    orderBy?: Array<Record<string, 'asc' | 'desc'>>;
}

export interface CreatePageData {
    title: string;
    slug: string;
    content: Array<{
        id: string;
        type: 'paragraph' | 'heading' | 'list' | 'task' | 'code' | 'image';
        content: string;
        properties: Record<string, any>;
    }>;
    parentId?: string | null;
    path: string[];
    level: number;
    order: number;
    workspaceId: string;
    teamSpaceId?: string | null;
    createdBy: string;
    kind?: 'doc' | 'database' | 'project';
    databaseConfig?: {
        table: 'projects' | 'tasks' | 'custom';
        viewType?: 'table' | 'board' | 'calendar';
        filters?: Record<string, any>;
        sorts?: Record<string, 'asc' | 'desc'>;
    } | null;
}

export interface UpdatePageData {
    title?: string;
    slug?: string;
    path?: string[];
    level?: number;
    order?: number;
    content?: Array<{
        id: string;
        type: 'paragraph' | 'heading' | 'list' | 'task' | 'code' | 'image';
        content: string;
        properties: Record<string, any>;
    }>;
    kind?: 'doc' | 'database' | 'project';
    databaseConfig?: {
        table: 'projects' | 'tasks' | 'custom';
        viewType?: 'table' | 'board' | 'calendar';
        filters?: Record<string, any>;
        sorts?: Record<string, 'asc' | 'desc'>;
    } | null;
}

export const db = {
    page: {
        findMany: async (query: PageQuery) => {
            await dbConnect();

            let mongoQuery = Page.find();

            if (query.where) {
                const filter: any = {};

                if (query.where.workspaceId) filter.workspaceId = query.where.workspaceId;
                if (query.where.teamSpaceId !== undefined) filter.teamSpaceId = query.where.teamSpaceId;
                if (query.where.parentId !== undefined) filter.parentId = query.where.parentId;
                if (query.where.slug) filter.slug = query.where.slug;
                if (query.where.path?.equals) filter.path = query.where.path.equals;
                if (query.where.id?.in) filter._id = { $in: query.where.id.in };
                if (query.where._id?.$in) filter._id = query.where._id;

                mongoQuery = mongoQuery.where(filter);
            }

            if (query.orderBy) {
                const sortObj: any = {};
                query.orderBy.forEach(order => {
                    const [field, direction] = Object.entries(order)[0];
                    sortObj[field] = direction === 'asc' ? 1 : -1;
                });
                mongoQuery = mongoQuery.sort(sortObj);
            }

            return await mongoQuery.lean();
        },

        findFirst: async (query: PageQuery) => {
            const results = await db.page.findMany({ ...query });
            return results[0] || null;
        },

        findUnique: async (query: { where: { id: string } }) => {
            await dbConnect();
            return await Page.findById(query.where.id).lean();
        },

        create: async (data: { data: CreatePageData }) => {
            await dbConnect();
            const page = new Page(data.data);
            return await page.save();
        },

        update: async (query: { where: { id: string }; data: UpdatePageData }) => {
            await dbConnect();
            return await Page.findByIdAndUpdate(
                query.where.id,
                query.data,
                { new: true, lean: true }
            );
        },

        deleteMany: async (query: { where: { id?: { in: string[] }; _id?: { $in: string[] } } }) => {
            await dbConnect();
            const filter = query.where.id?.in
                ? { _id: { $in: query.where.id.in } }
                : query.where._id
                    ? { _id: query.where._id }
                    : {};

            const result = await Page.deleteMany(filter);
            return { count: result.deletedCount || 0 };
        },
    },

    $transaction: async <T>(fn: (tx: typeof db) => Promise<T>): Promise<T> => {
        await dbConnect();
        const session = await mongoose.startSession();

        try {
            return await session.withTransaction(async () => {
                // Create a transaction-aware version of db
                const txDb = {
                    ...db,
                    page: {
                        ...db.page,
                        // Override methods to use session
                        create: async (data: { data: CreatePageData }) => {
                            const [page] = await Page.create([data.data], { session });
                            return page;
                        },
                        update: async (query: { where: { id: string }; data: UpdatePageData }) => {
                            return await Page.findByIdAndUpdate(
                                query.where.id,
                                query.data,
                                { new: true, lean: true, session }
                            );
                        },
                        deleteMany: async (query: { where: { id?: { in: string[] }; _id?: { $in: string[] } } }) => {
                            const filter = query.where.id?.in
                                ? { _id: { $in: query.where.id.in } }
                                : query.where._id
                                    ? { _id: query.where._id }
                                    : {};

                            const result = await Page.deleteMany(filter).session(session);
                            return { count: result.deletedCount || 0 };
                        },
                        findMany: async (query: PageQuery) => {
                            let mongoQuery = Page.find();

                            if (query.where) {
                                const filter: any = {};

                                if (query.where.workspaceId) filter.workspaceId = query.where.workspaceId;
                                if (query.where.teamSpaceId !== undefined) filter.teamSpaceId = query.where.teamSpaceId;
                                if (query.where.parentId !== undefined) filter.parentId = query.where.parentId;
                                if (query.where.slug) filter.slug = query.where.slug;
                                if (query.where.path?.equals) filter.path = query.where.path.equals;
                                if (query.where.id?.in) filter._id = { $in: query.where.id.in };
                                if (query.where._id?.$in) filter._id = query.where._id;

                                mongoQuery = mongoQuery.where(filter);
                            }

                            if (query.orderBy) {
                                const sortObj: any = {};
                                query.orderBy.forEach(order => {
                                    const [field, direction] = Object.entries(order)[0];
                                    sortObj[field] = direction === 'asc' ? 1 : -1;
                                });
                                mongoQuery = mongoQuery.sort(sortObj);
                            }

                            return await mongoQuery.session(session).lean();
                        },
                        findFirst: async (query: PageQuery) => {
                            const results = await txDb.page.findMany({ ...query });
                            return results[0] || null;
                        },
                        findUnique: async (query: { where: { id: string } }) => {
                            return await Page.findById(query.where.id).session(session).lean();
                        },
                    }
                };

                return await fn(txDb);
            });
        } finally {
            await session.endSession();
        }
    },
};