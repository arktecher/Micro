import { useAuth } from "@/contexts/AuthContext";
import { corporateRoleAllowsAdmin, corporateRoleAllowsEdit, type CorporateOrgRole, } from "@/lib/corporatePermissions";
export function useCorporatePermissions(mergedRole?: CorporateOrgRole | null) {
    const { corporateRole, userType } = useAuth();
    const isCorporate = userType === "corporate";
    const effective: CorporateOrgRole | null = mergedRole !== undefined ? mergedRole : corporateRole;
    return {
        corporateRole: effective,
        canEdit: isCorporate && corporateRoleAllowsEdit(effective),
        canAdmin: isCorporate && corporateRoleAllowsAdmin(effective),
        isCorporate,
    };
}
