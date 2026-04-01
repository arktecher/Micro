import { useAuth } from "@/contexts/AuthContext";
import {
  corporateRoleAllowsAdmin,
  corporateRoleAllowsEdit,
  type CorporateOrgRole,
} from "@/lib/corporatePermissions";

/**
 * Client RBAC aligned with backend (primary / admin / editor / viewer).
 * Prefer: `useCorporatePermissions(profile?.corporate_role ?? corporateRole)` when profile is loaded from GET /users/me.
 */
export function useCorporatePermissions(mergedRole?: CorporateOrgRole | null) {
  const { corporateRole, userType } = useAuth();
  const isCorporate = userType === "corporate";
  const effective: CorporateOrgRole | null =
    mergedRole !== undefined ? mergedRole : corporateRole;

  return {
    corporateRole: effective,
    canEdit: isCorporate && corporateRoleAllowsEdit(effective),
    canAdmin: isCorporate && corporateRoleAllowsAdmin(effective),
    isCorporate,
  };
}
