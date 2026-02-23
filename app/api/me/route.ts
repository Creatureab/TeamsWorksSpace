import { getAuth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/model/user";

export async function GET() {
    try {
        const { userId } = await getAuth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            return new NextResponse("User not found in database", { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("[USER_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
