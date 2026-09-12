import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/authToken";

export type TeamRole = "owner" | "member";

export interface TeamMember {
  user_id: string;
  email: string;
  role: TeamRole;
  created_at: string;
}

export interface TeamMembersResponse {
  members: TeamMember[];
}

export interface TeamInviteResponse {
  message: string;
  user_id: string;
  email_sent: boolean;
}

const token = (): string | undefined => getAuthToken() ?? undefined;

export const teamApi = {
  listMembers: (): Promise<TeamMembersResponse> =>
    api.get<TeamMembersResponse>("/team/members", token()),

  invite: (
    email: string,
    role: TeamRole = "member",
  ): Promise<TeamInviteResponse> =>
    api.post<TeamInviteResponse>(
      "/team/invite",
      { email: email.trim().toLowerCase(), role },
      token(),
    ),

  removeMember: (userId: string): Promise<void> =>
    api.delete<void>(`/team/members/${userId}`, token()),

  updateRole: (
    userId: string,
    role: TeamRole,
  ): Promise<{ message: string }> =>
    api.patch<{ message: string }>(
      `/team/members/${userId}`,
      { role },
      token(),
    ),
};
