import { Suspense } from "react";
import { Studio } from "@/components/studio";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Studio />
    </Suspense>
  );
}
