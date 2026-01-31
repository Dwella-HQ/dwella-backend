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
