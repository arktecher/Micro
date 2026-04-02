export type CorporateOrgRole = "primary" | "admin" | "editor" | "viewer";
export function corporateRoleAllowsEdit(role: CorporateOrgRole | null | undefined): boolean {
    if (!role)
        return false;
    return role === "primary" || role === "admin" || role === "editor";
}
export function corporateRoleAllowsAdmin(role: CorporateOrgRole | null | undefined): boolean {
    if (!role)
        return false;
    return role === "primary" || role === "admin";
}
