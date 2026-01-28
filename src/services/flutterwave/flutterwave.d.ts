import { CurrenciesEnum } from 'src/utils/constants';
import { Wallet } from 'src/wallet/entities/wallet.entity';

export interface FlutterwaveGenerateAccessTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  'not-before-policy': number;
  scope: string;
}

export interface FlutterwaveCreateStaticVirtualAccountPayload {
  firstName: string;
  lastName: string;
  email: string;
  currency: 'NGN' | 'GHS';
  bvn?: string;
  reference: string;
}

export interface FlutterwaveCreateCustomerResponse {
  status: 'success';
  message: 'Customer created';
  data: {
    id: string;
    email: string;
    name: {
      first: string;
      last: string;
    };
    meta: Record<string, unknown>;
    created_datetime: string;
  };
}

export interface FlutterwaveCreateStaticVirtualAccountResponse {
  status: string;
  message: string;
  data: {
    id: string;
    amount: number;
    account_number: string;
    reference: string;
    account_bank_name: string;
    account_type: string;
    status: string;
    account_expiration_datetime: string;
    note: string;
    customer_id: string;
    created_datetime: string;
    meta: Record<string, unknown>;
  };
}

export interface FlutterwaveConfirmBankAccountNumberRequest {
  account_number: string;
  bank_code: string;
  currency?: CurrenciesEnum;
}

export interface FlutterwaveConfirmBankAccountNumberResponse {
  status: string;
  message: string;
  data: {
    bank_code: string;
    account_number: string;
    account_name: string;
  };
}

export interface FlutterwaveWithdrawToBankAccountPayload {
  bank_code: string;
  account_number: string;
  amount: number;
  narration?: string;
  reference: string;
  wallet: Wallet;
}
