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
}

export enum RegistrationTypeEnum {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  GITHUB = 'GITHUB',
}
