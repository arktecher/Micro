import { useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  corporateRoleAllowsAdmin,
  corporateRoleAllowsEdit,
  type CorporateOrgRole,
} from "@/lib/corporatePermissions";

/**
 * Syncs org role from GET /users/me via AuthContext; exposes permission flags for UI / skipping API calls.
 */
export function useCorporateOrgRole(profileCorporateRole?: CorporateOrgRole | null) {
  const { corporateRole, userType, refreshCorporateRole } = useAuth();

  useEffect(() => {
    if (userType !== "corporate") return;
    void refreshCorporateRole();
  }, [userType, refreshCorporateRole]);

  const orgRole = useMemo((): CorporateOrgRole | null => {
    return corporateRole ?? profileCorporateRole ?? null;
  }, [corporateRole, profileCorporateRole]);

  const canEdit = corporateRoleAllowsEdit(orgRole);
  const canAdmin = corporateRoleAllowsAdmin(orgRole);

  return useMemo(
    () => ({
      orgRole,
      canEdit,
      canAdmin,
    }),
    [orgRole, canEdit, canAdmin],
  );
}
