export type MonnifyLoginResponse = {
  requestSuccessful: true;
  responseCode: 0;
  responseBody: {
    accessToken: string;
    expiresIn: number;
  };
};

export interface MonnifyCreateVirtualAccountPayload {
  accountName: string;
  accountReference: string;
  currencyCode: 'NGN' | 'GHS';
  customerEmail: string;
  bvn?: string;
  customerName?: string;
}

export interface MonnifyCreateVirtualAccountResponse {
  requestSuccessful: true;
  responseMessage: 'success';
  responseCode: '0';
  responseBody: {
    contractCode: string;
    accountReference: string;
    accountName: string;
    currencyCode: string;
    customerEmail: string;
    customerName: string;
    accounts: Array<{
      bankCode: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
    }>;
    collectionChannel: string;
    reservationReference: string;
    reservedAccountType: string;
    status: string;
    createdOn: string;
    incomeSplitConfig: Array<{
      subAccountCode: string;
      feePercentage: number;
      feeBearer: boolean;
      splitPercentage: number;
      reservedAccountConfigCode: string;
    }>;
    bvn: string;
    restrictPaymentSource: boolean;
    allowedPaymentSources: {
      bvns: string[];
      bankAccounts: Array<{
        accountNumber: string;
        bankCode: string;
      }>;
      accountNames: string[];
    };
  };
}
