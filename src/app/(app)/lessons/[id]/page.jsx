"use client";

import { useParams } from "next/navigation";
import LessonDetail from "@/src/views/LessonDetail";

export default function Page() {
  const params = useParams();
  return <LessonDetail lessonId={params?.id} />;
}