import { Suspense } from "react";

import { TabletExperience } from "@/components/tablet-experience";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center text-sm uppercase tracking-[0.28em] text-cream/45">
          Tuning the tablet
        </div>
      }
    >
      <TabletExperience />
    </Suspense>
  );
}
