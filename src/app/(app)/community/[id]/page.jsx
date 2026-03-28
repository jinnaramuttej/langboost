"use client";

import { useParams } from "next/navigation";
import CommunityThread from "@/src/views/CommunityThread";

export default function Page() {
  const params = useParams();
  return <CommunityThread threadId={params?.id} />;
}