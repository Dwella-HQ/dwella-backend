export interface PaystackCreateCustomerPayload {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface PaystackCustomerResponse {
  status: boolean;
  message: string;
  data: {
    email: string;
    integration: number;
    domain: string;
    customer_code: string;
    id: number;
    identified: boolean;
    identifications: null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface PaystackAssignVirtualAccountPayload {
  email: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  phone?: string;
  country?: 'NG' | 'GH';
  bvn?: string;
  metadata?: Record<string, any>;
}

export interface PaystackAssignVirtualAccountResponse {
  status: boolean;
  message: string;
}

export interface PaystackDedicatedAccountAssignSuccessWebhookPayload {
  event: 'dedicatedaccount.assign.success';
  data: {
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: Record<string, any>;
      risk_action: string;
      international_format_phone: string;
    };
    dedicated_account: {
      bank: {
        name: string;
        id: number;
        slug: string;
      };
      account_name: string;
      account_number: string;
      assigned: boolean;
      currency: string;
      metadata: null;
      active: boolean;
      id: number;
      created_at: string;
      updated_at: string;
      assignment: {
        integration: number;
        assignee_id: number;
        assignee_type: string;
        expired: boolean;
        account_type: string;
        assigned_at: string;
        expired_at: null;
      };
    };
    identification: {
      status: string;
    };
  };
}

export interface PaystackDedicatedAccountAssignFailureWebhookPayload {
  event: 'dedicatedaccount.assign.failed';
  data: {
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: Record<string, unknown>;
      risk_action: string;
      international_format_phone: string;
    };
    dedicated_account: null;
    identification: {
      status: string;
    };
  };
}

export interface PaystackInitializeTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackChargeSuccessWebhookPayload {
  event: 'charge.success';
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: null;
    metadata: {
      receiver_account_number: string;
      receiver_bank: string;
      receiver_account_type: null;
      custom_fields: any[];
    };
    fees_breakdown: null;
    log: null;
    fees: number;
    fees_split: null;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: null;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: null;
      account_name: null;
      sender_country: string;
      sender_bank: string;
      sender_bank_account_number: string;
      receiver_bank_account_number: string;
      receiver_bank: string;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: Record<string, any>;
      risk_action: string;
      international_format_phone: string;
    };
    plan: Record<string, any>;
    subaccount: Record<string, any>;
    split: Record<string, any>;
    order_id: null;
    paidAt: string;
    requested_amount: number;
    pos_transaction_data: null;
    source: null;
  };
}

export interface PaystackTransactionVerificationResponse {
  status: true;
  message: 'Verification successful';
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    receipt_number: null;
    amount: number;
    message: null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: string | Record<string, any>;
    log: {
      start_time: number;
      time_spent: number;
      attempts: number;
      errors: number;
      success: boolean;
      mobile: boolean;
      input: unknown[];
      history: Array<{
        type: string;
        message: string;
        time: number;
      }>;
    };
    fees: number;
    fees_split: null;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: null;
    };
    customer: {
      id: number;
      first_name: null;
      last_name: null;
      email: string;
      customer_code: string;
      phone: null;
      metadata: null;
      risk_action: string;
      international_format_phone: null;
    };
    plan: null;
    split: Record<string, unknown>;
    order_id: null;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: null;
    source: null;
    fees_breakdown: null;
    connect: null;
    transaction_date: string;
    plan_object: Record<string, unknown>;
    subaccount: Record<string, unknown>;
  };
}

export interface PaystackListBanksResponse {
  status: boolean;
  message: string;
  data: Array<{
    name: string;
    slug: string;
    code: string;
    longcode: string;
    gateway: string | null;
    pay_with_bank: boolean;
    active: boolean;
    is_deleted: boolean;
    country: string;
    currency: string;
    type: string;
    id: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface PaystackResolveAccountResponse {
  status: boolean;
  message: string;
  data: {
    account_name: string;
    account_number: string;
  };
}
