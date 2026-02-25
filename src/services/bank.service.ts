/**
 * Bank Service
 * Handles bank account management
 */
import { api } from "@/lib/api";

export interface BankAccount {
  id: string;
  bank_name: string;
  branch_name: string;
  account_type: string; // "普通" or "当座"
  account_number_masked: string; // Last 4 digits only
  account_holder_name: string; // Account holder name in Katakana
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankAccountRequest {
  bank_name: string;
  branch_name: string;
  account_type: string; // "普通" or "当座"
  account_number: string; // 7 digits
  account_holder_kana: string; // Account holder name in Katakana
}

export const bankService = {
  /**
   * Get bank account for current artist
   */
  async getBankAccount(): Promise<BankAccount> {
    return api.get<BankAccount>("/artists/me/bank-account");
  },

  /**
   * Register bank account
   */
  async registerBankAccount(data: BankAccountRequest): Promise<BankAccount> {
    return api.post<BankAccount>("/artists/me/bank-account", data);
  },

  /**
   * Update bank account
   */
  async updateBankAccount(data: BankAccountRequest): Promise<BankAccount> {
    return api.put<BankAccount>("/artists/me/bank-account", data);
  },
};
