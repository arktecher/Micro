/**
 * Corporate team invitations (法人メンバー招待)
 */
import { api } from "@/lib/api";

export type CorporateInviteRole = "admin" | "editor" | "viewer";

export interface CorporateInvitation {
  id: string;
  email: string;
  role: CorporateInviteRole | string;
  job_title?: string | null;
  status: string;
  created_at: string;
  expires_at: string;
  invite_url?: string | null;
  /** Present on create: whether the backend accepted the mail (Resend or SMTP) */
  email_sent?: boolean | null;
}

export interface CreateCorporateInvitationBody {
  email: string;
  role: CorporateInviteRole;
  job_title?: string;
}

/** Public preview (no auth) */
export interface InvitationPreview {
  valid: boolean;
  company_name?: string | null;
  email?: string | null;
  role?: string | null;
  job_title?: string | null;
  expires_at?: string | null;
  error?: string | null;
}

export interface AcceptInvitationResponse {
  access_token: string;
  token_type: string;
  user: { id: string; email: string; user_type: string; name: string };
}

export const corporateInvitationsService = {
  async list(): Promise<CorporateInvitation[]> {
    return api.get<CorporateInvitation[]>("/corporate/invitations");
  },

  async create(body: CreateCorporateInvitationBody): Promise<CorporateInvitation> {
    return api.post<CorporateInvitation>("/corporate/invitations", body);
  },

  async revoke(invitationId: string): Promise<void> {
    await api.delete(`/corporate/invitations/${invitationId}`);
  },

  /** Public — validate token and show invite details */
  async previewPublic(token: string): Promise<InvitationPreview> {
    return api.get<InvitationPreview>(
      `/corporate/invitations/preview?token=${encodeURIComponent(token)}`,
    );
  },

  /** Public — create account and join org */
  async acceptPublic(body: {
    token: string;
    name: string;
    password: string;
  }): Promise<AcceptInvitationResponse> {
    return api.post<AcceptInvitationResponse>("/corporate/invitations/accept", body);
  },
};
