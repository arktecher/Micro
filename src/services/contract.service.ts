import { api } from "@/lib/api";
export interface Contract {
    id: string;
    type: string;
    status: string;
    contract_url: string;
    signed_at?: string;
}
export const contractService = {
    async listContracts(): Promise<Contract[]> {
        throw new Error("Not implemented yet - Phase 7");
    },
    async getContract(contractId: string): Promise<Contract> {
        throw new Error("Not implemented yet - Phase 7");
    },
};
