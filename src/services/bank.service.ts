import { api } from "@/lib/api";
export interface BankAccount {
    id: string;
    bank_name: string;
    branch_name: string;
    account_type: string;
    account_number_masked: string;
    account_holder_name: string;
    is_primary: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}
export interface BankAccountRequest {
    bank_name: string;
    branch_name: string;
    account_type: string;
    account_number: string;
    account_holder_kana: string;
}
export const bankService = {
    async getBankAccount(): Promise<BankAccount> {
        return api.get<BankAccount>("/artists/me/bank-account");
    },
    async registerBankAccount(data: BankAccountRequest): Promise<BankAccount> {
        return api.post<BankAccount>("/artists/me/bank-account", data);
    },
    async updateBankAccount(data: BankAccountRequest): Promise<BankAccount> {
        return api.put<BankAccount>("/artists/me/bank-account", data);
    },
};
