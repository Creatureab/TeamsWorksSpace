"use server"

import dbConnect from "@/lib/mongodb";
import { Block } from "@/lib/model/block";
import { syncUser } from "@/lib/sync-user";
import { revalidatePath } from "next/cache";

export async function getBlocks(pageId: string) {
    try {
        await dbConnect();
        const blocks = await Block.find({ pageId }).sort({ order: 1 }).lean();
        return JSON.parse(JSON.stringify(blocks));
    } catch (error) {
        console.error("Error fetching blocks:", error);
        return [];
    }
}

export async function saveBlocks(pageId: string, workspaceId: string, blocks: any[]) {
    try {
        const user = await syncUser();
        if (!user) throw new Error("Unauthorized");

        await dbConnect();

        // Use a bulk operation to update all blocks at once
        // This is much faster than individual updates
        const bulkOps = blocks.map((block, index) => ({
            updateOne: {
                filter: { id: block.id },
                update: {
                    ...block,
                    pageId,
                    workspaceId,
                    order: index, // Ensure order is preserved
                    lastEditedBy: user._id
                },
                upsert: true
            }
        }));

        // Handle deletions: Remove blocks that are not in the new set
        const currentBlockIds = blocks.map(b => b.id);
        await Block.deleteMany({
            pageId,
            id: { $nin: currentBlockIds }
        });

        if (bulkOps.length > 0) {
            await Block.bulkWrite(bulkOps);
        }

        revalidatePath(`/workspace/${workspaceId}`);
        return { success: true };
    } catch (error) {
        console.error("Error saving blocks:", error);
        return { success: false, error: "Failed to save changes" };
    }
}
