export enum USER_ROLES {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SUB_ADMIN = 'sub_admin',
  LANDLORD = 'landlord',
  PROPERTY_MANAGER = 'property_manager',
  AGENT = 'agent',
  MAINTENANCE_STAFF = 'maintenance_staff',
  TENANT = 'tenant',
}

export const NonAdminRoles = [
  USER_ROLES.LANDLORD,
  USER_ROLES.PROPERTY_MANAGER,
  USER_ROLES.AGENT,
  USER_ROLES.MAINTENANCE_STAFF,
  USER_ROLES.TENANT,
];

export const AdminRoles = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.SUB_ADMIN,
];

export enum PERMISSIONS {
  //Role Management
  CREATE_ROLE = 'create_role',
  READ_ROLE = 'read_role',
  UPDATE_ROLE = 'update_role',
  DELETE_ROLE = 'delete_role',

  // Permission Management
  CREATE_PERMISSION = 'create_permission',
  READ_PERMISSION = 'read_permission',
  UPDATE_PERMISSION = 'update_permission',
  DELETE_PERMISSION = 'delete_permission',

  // Landlord Management
  CREATE_LANDLORD = 'create_landlord',
  READ_LANDLORD = 'read_landlord',
  UPDATE_LANDLORD = 'update_landlord',
  DELETE_LANDLORD = 'delete_landlord',
  APPROVE_LANDLORD = 'approve_landlord',

  // Property Management
  CREATE_PROPERTY = 'create_property',
  READ_PROPERTY = 'read_property',
  UPDATE_PROPERTY = 'update_property',
  DELETE_PROPERTY = 'delete_property',
  APPROVE_PROPERTY = 'approve_property',

  // User Management
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  ASSIGN_ROLE = 'assign_role',

  // Wallet Management
  MANAGE_WALLET = 'manage_wallet',

  // Settings Management
  MANAGE_SETTINGS = 'manage_settings',
}

export enum RegistrationTypeEnum {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  GITHUB = 'GITHUB',
}

export enum CurrenciesEnum {
  NGN = 'NGN',
}

export enum TransactionTypeEnum {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionActionEnum {
  RENT_PAYMENT = 'rent_payment',
  SECURITY_DEPOSIT = 'security_deposit',
  MAINTENANCE_FEE = 'maintenance_fee',
  UTILITY_BILL = 'utility_bill',
  OTHER = 'other',
}

export enum PaymentProviderEnum {
  PAYSTACK = 'paystack',
  MONNIFY = 'monnify',
  FLUTTERWAVE = 'flutterwave',
}

export const JOB_NAMES = {
  VBA_CREATION_JOB: 'VBA_CREATION_JOB',
};
