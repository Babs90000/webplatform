"use client";

import React from "react";
import { AuthGuard } from "@/shared/components/AuthGuard";
import { TeamSettings } from "@/features/team";

const TeamSettingsPage: React.FC = () => {
  return (
    <AuthGuard>
      <TeamSettings />
    </AuthGuard>
  );
};

export default TeamSettingsPage;
