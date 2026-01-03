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
  country?: string;
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
      metadata: Record<string, unknown>;
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
