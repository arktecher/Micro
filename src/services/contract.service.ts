/**
 * Contract Service
 * Handles contract generation, signing, and management
 * 
 * NOTE: Will be fully implemented in Phase 7
 */
import { api } from "@/lib/api";

export interface Contract {
  id: string;
  type: string;
  status: string;
  contract_url: string;
  signed_at?: string;
}

export const contractService = {
  /**
   * List contracts
   * TODO: Implement in Phase 7
   */
  async listContracts(): Promise<Contract[]> {
    // return api.get("/contracts");
    throw new Error("Not implemented yet - Phase 7");
  },

  /**
   * Get contract details
   * TODO: Implement in Phase 7
   */
  async getContract(contractId: string): Promise<Contract> {
    // return api.get(`/contracts/${contractId}`);
    throw new Error("Not implemented yet - Phase 7");
  },
};
