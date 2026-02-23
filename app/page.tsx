import { redirect } from "next/navigation";
import { getAuth } from "@clerk/nextjs/server";

export default async function RootPage() {
  const { userId } = await getAuth();
  
  if (userId) {
    redirect("/workspace");
  } else {
    redirect("/landing");
  }
}
