"use client";

import React from "react";
import { useSession } from "@/lib/session-context";
import { CMSEditor } from "@/components/dashboard/cms-editor";

export default function DashboardCMSPage() {
  const { projects } = useSession();

  return (
    <div className="space-y-6">
      <CMSEditor projects={projects} />
    </div>
  );
}
