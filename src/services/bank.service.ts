/**
 * Bank Service
 * Handles bank account management
 * 
 * NOTE: Will be fully implemented in Phase 3
 */
import { api } from "@/lib/api";

export interface BankAccount {
  id: string;
  account_type: string;
  bank_name: string;
  branch_name: string;
  account_number_masked: string;
  account_holder_kana: string;
  status: string;
}

export const bankService = {
  /**
   * Get bank account
   * TODO: Implement in Phase 3
   */
  async getBankAccount(): Promise<BankAccount> {
    // return api.get("/artists/me/bank-account");
    throw new Error("Not implemented yet - Phase 3");
  },

  /**
   * Register bank account
   * TODO: Implement in Phase 3
   */
  async registerBankAccount(data: any): Promise<BankAccount> {
    // return api.post("/artists/me/bank-account", data);
    throw new Error("Not implemented yet - Phase 3");
  },
};
