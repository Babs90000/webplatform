"use client";

import React from "react";
import { AuthGuard } from "@/shared/components/AuthGuard";
import { PlatformSettings } from "@/features/platform";

const SettingsPage: React.FC = () => {
  return (
    <AuthGuard>
      <PlatformSettings />
    </AuthGuard>
  );
};

export default SettingsPage;
