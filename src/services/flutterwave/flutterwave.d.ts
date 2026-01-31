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
}
