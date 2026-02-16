import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/model/user";

export async function syncUser() {
    const clerkUser = await currentUser();

    if (!clerkUser) return null;

    await dbConnect();

    try {
        const email = clerkUser.emailAddresses[0]?.emailAddress;

        const user = await User.findOneAndUpdate(
            { clerkId: clerkUser.id },
            {
                clerkId: clerkUser.id,
                email: email,
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                imageUrl: clerkUser.imageUrl,
                updatedAt: new Date(),
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        return {
            ...user.toObject(),
            publicMetadata: clerkUser.publicMetadata
        };
    } catch (error) {
        console.error("Error syncing user:", error);
        return null;
    }
}
