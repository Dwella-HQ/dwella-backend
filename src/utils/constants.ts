import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { CreateAmenityDto } from 'src/amenities/dto/create-amenity.dto';

export enum USER_ROLES {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SUB_ADMIN = 'sub_admin',
  LANDLORD = 'landlord',
  PROPERTY_MANAGER = 'property_manager',
  AGENT = 'agent',
  MAINTENANCE_STAFF = 'maintenance_staff',
  TENANT = 'tenant',
  USER = 'user',
}

export enum INVITE_STATUS {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export const NonAdminRoles = [
  USER_ROLES.LANDLORD,
  USER_ROLES.PROPERTY_MANAGER,
  USER_ROLES.AGENT,
  USER_ROLES.MAINTENANCE_STAFF,
  USER_ROLES.TENANT,
  USER_ROLES.USER,
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

  //Address Management
  MANAGE_ADDRESS = 'manage_address',

  //Amenities
  MANAGE_AMENITIES = 'manage_amenities',

  // Transactions
  MANAGE_TRANSACTIONS = 'manage_transactions',

  //TENANT
  INVITE_TENANT = 'invite_tenant',

  //Property Managers
  CREATE_PROPERTY_MANAGER = 'create_property_manager',
  READ_PROPERTY_MANAGER = 'read_property_manager',
  UPDATE_PROPERTY_MANAGER = 'update_property_manager',
  DELETE_PROPERTY_MANAGER = 'delete_property_manager',

  //MAINTENANCE REQUESTS
  CREATE_MAINTENANCE_REQUEST = 'create_maintenance_request',
  MANAGE_MAINTENANCE_REQUESTS = 'manage_maintenance_requests',

  // CHAT
  MANAGE_CHAT = 'manage_chat',
  READ_CHAT = 'read_chat',
  DELETE_CHAT = 'delete_chat',
  UPDATE_CHAT = 'update_chat',
  CREATE_CHAT = 'create_chat',

  // Payments
  CREATE_PAYMENT = 'create_payment',
  READ_PAYMENT = 'read_payment',
  UPDATE_PAYMENT = 'update_payment',
  DELETE_PAYMENT = 'delete_payment',
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

export enum TransactionStatusEnum {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

export enum TransactionActionEnum {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
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

export enum PaymentMethodEnum {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
}

export enum VerificationTypeEnum {
  LANDLORD_VERIFICATION = 'LANDLORD_VERIFICATION',
  TENANT_VERIFICATION = 'TENANT_VERIFICATION',
  PROPERTY_VERIFICATION = 'PROPERTY_VERIFICATION',
}

export enum VerificationStatusEnum {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export const JOB_NAMES = {
  APP_NOTIFICATION: 'APP_NOTIFICATION',
  EMAIL_NOTIFICATION: 'EMAIL_NOTIFICATION',
  VBA_CREATION_JOB: 'VBA_CREATION_JOB',
  HANDLE_TRANSACTION_JOB: 'HANDLE_TRANSACTION_JOB',
};

export class TransferUserDetails {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNumberString()
  @IsOptional()
  bankCode?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsNumberString()
  @Length(10, 10)
  @IsOptional()
  accountNumber?: string;
}

export enum NotificationTypeEnum {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export const DefaultAmenities: CreateAmenityDto[] = [
  // In-Unit Amenities - Appliances
  { name: 'Refrigerator', description: 'Full-size refrigerator included' },
  { name: 'Microwave', description: 'Built-in or countertop microwave' },
  { name: 'Garbage Disposal', description: 'In-sink garbage disposal unit' },
  {
    name: 'Energy-Efficient Appliances',
    description: 'ENERGY STAR certified appliances',
  },

  // In-Unit Amenities - Laundry
  {
    name: 'In-Unit Washer and Dryer',
    description: 'Private washer and dryer in the unit',
  },

  // In-Unit Amenities - Comfort
  {
    name: 'Air Conditioning',
    description: 'Central or window air conditioning',
  },
  {
    name: 'Ceiling Fans',
    description: 'Ceiling fans in living areas and bedrooms',
  },

  // In-Unit Amenities - Flooring & Finishes
  {
    name: 'Hardwood Floors',
    description: 'Real or engineered hardwood flooring',
  },
  { name: 'Walk-In Closets', description: 'Spacious walk-in closet storage' },
  {
    name: 'High-End Fixtures',
    description: 'Premium bathroom and kitchen fixtures',
  },
  {
    name: 'Vaulted Ceilings',
    description: 'High vaulted or cathedral ceilings',
  },

  // In-Unit Amenities - Outdoor Access
  { name: 'Private Balcony', description: 'Private outdoor balcony space' },
  { name: 'Patio', description: 'Ground-level patio area' },
  { name: 'Deck', description: 'Private deck with outdoor access' },

  // In-Unit Amenities - Technology
  {
    name: 'Smart Home Technology',
    description: 'Smart home devices and controls',
  },
  {
    name: 'High-Speed Internet',
    description: 'High-speed internet connectivity available',
  },
  {
    name: 'Keyless Entry/Smart Lock',
    description: 'Electronic keyless entry system',
  },

  // Community Amenities - Fitness & Wellness
  {
    name: '24/7 Fitness Center',
    description: 'Fully-equipped fitness center with 24/7 access',
  },
  { name: 'Swimming Pool', description: 'Community swimming pool' },
  { name: 'Yoga Studio', description: 'Dedicated yoga and meditation studio' },
  { name: 'Sauna', description: 'Sauna and steam room facilities' },

  // Community Amenities - Social & Entertainment
  {
    name: 'Clubhouse',
    description: 'Community clubhouse for events and gatherings',
  },
  {
    name: 'Game Room',
    description: 'Recreation room with games and entertainment',
  },
  {
    name: 'Rooftop Lounge/Deck',
    description: 'Rooftop terrace with lounge seating',
  },
  { name: 'BBQ Area', description: 'Outdoor grilling and BBQ stations' },

  // Community Amenities - Work & Convenience
  {
    name: 'Co-Working Spaces',
    description: 'Shared workspace with high-speed internet',
  },
  {
    name: 'Business Center',
    description: 'Professional business center with office equipment',
  },
  { name: 'Package Lockers', description: 'Secure package delivery lockers' },
  {
    name: 'On-Site Retail Shops',
    description: 'Convenient on-site retail and services',
  },

  // Community Amenities - Parking & Security
  { name: 'Covered Parking', description: 'Protected covered parking spaces' },
  { name: 'Secure Entry', description: 'Controlled access entry system' },
  {
    name: 'On-Site Security/Concierge',
    description: '24/7 security staff or concierge service',
  },

  // Community Amenities - Outdoor Spaces
  {
    name: 'Landscaped Gardens',
    description: 'Professionally maintained garden areas',
  },
  { name: 'Playgrounds', description: "Children's playground and play area" },

  // Basic/Standard Amenities
  {
    name: 'On-Site Maintenance and Management',
    description: 'Professional property management and maintenance staff',
  },
  {
    name: 'Trash Removal',
    description: 'Regular trash collection and disposal service',
  },
  {
    name: 'Controlled Secure Access',
    description: 'Gated or controlled building access',
  },
  { name: 'Elevators', description: 'Elevator access to all floors' },
];

export enum NextOfKinRelationshipEnum {
  PARENT = 'Parent',
  SIBLING = 'Sibling',
  SPOUSE = 'Spouse',
  CHILD = 'Child',
  FRIEND = 'Friend',
  OTHER = 'Other',
}
export class NextOfKinDetails {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEnum(NextOfKinRelationshipEnum)
  relationship: NextOfKinRelationshipEnum;

  @IsPhoneNumber()
  contactNumber: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export enum RentFrequencyEnum {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum ServiceChargeFrequencyEnum {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  ONE_TIME = 'one_time',
}

export enum MaintenanceRequestTypes {
  PLUMBING = 'plumbing',
}

export enum MaintenanceRequestLevel {
  PROPERTY = 'PROPERTY',
  UNIT = 'UNIT',
}

export enum MaintenanceRequestPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum MaintenanceRequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum RentPaymentStatusEnum {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum RentStatusEnum {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
}

export enum IdTypeEnum {
  NATIONAL_ID = 'NATIONAL_ID',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  PASSPORT = 'PASSPORT',
  OTHER = 'OTHER',
}
