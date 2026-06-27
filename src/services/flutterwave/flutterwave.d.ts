export interface FlutterwaveCreateStaticVirtualAccountPayload {
  firstName: string;
  lastName: string;
  email: string;
  currency: 'NGN' | 'GHS';
  bvn?: string;
  reference: string;
  phoneNumber?: string;
}

export interface FlutterwaveCreateCustomerResponse {
  status: string;
  message: string;
  data: {
    response_code: string;
    response_message: string;
    flw_ref: string;
    order_ref: string;
    account_number: string;
    frequency: string;
    bank_name: string;
    created_at: string;
    expiry_date: string;
    note: string;
    amount: string;
  };
}

export interface FlutterwaveCreateVirtualAccountResponse {
  status: string;
  message: string;
  data: {
    response_code: string;
    response_message: string;
    flw_ref: string;
    order_ref: string;
    account_number: string;
    frequency: string;
    bank_name: string;
    created_at: string;
    expiry_date: string;
    note: string;
    amount: string;
  };
}

export interface FlutterwaveCreatePaymentLinkPayload {
  status: string;
  message: string;
  data: {
    link: string;
  };
}

export interface FlutterwaveChargeCompletedPayload {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string | null;
      email: string;
      created_at: string;
    };
    card: {
      first_6digits: string;
      last_4digits: string;
      issuer: string;
      country: string;
      type: string;
      expiry: string;
    };
  };
}

export interface FlutterwaveTransferCompletedPayload {
  id: number;
  account_number: string;
  bank_name: string;
  bank_code: string;
  fullname: string;
  created_at: string;
  currency: string;
  debit_currency: string;
  amount: number;
  fee: number;
  status: string;
  reference: string;
  meta: any;
  narration: string;
  approver: string | null;
  complete_message: string;
  requires_approval: number;
  is_approved: number;
}

export interface FlutterwaveGetBanksResponse {
  status: string;
  message: string;
  data: {
    id: string;
    code: string;
    name: string;
  }[];
}

export interface FullterwaveTransactionWebhookPayload {
  id: string;
  txRef: string;
  flwRef: string;
  orderRef: string;
  paymentPlan: null;
  paymentPage: null;
  createdAt: string;
  amount: number;
  charged_amount: number;
  status: 'successful';
  IP: string;
  currency: string;
  appfee: number;
  merchantfee: number;
  merchantbearsfee: number;
  charge_type: 'normal';
  customer: {
    id: number;
    phone: string | null;
    fullName: string;
    customertoken: string | null;
    email: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    AccountId: number;
  };
  entity: {
    card6: string;
    card_last4: string;
    card_country_iso: string;
    createdAt: string;
    card_type: string | null;
  };
  'event.type': string;
}

export interface FlutterwaveResolveAccountResponse {
  status: string;
  message: string;
  data: {
    account_number: string;
    account_name: string;
  };
}
