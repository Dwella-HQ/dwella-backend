import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

export class EnvironmentVariables {
  @IsEnum(Environment, {
    message:
      'NODE_ENV must be one of: development, production, test, provision',
  })
  NODE_ENV: Environment;

  @IsString()
  @IsNotEmpty()
  APP_NAME: string;

  @IsUrl({
    // TODO on prod after deployment, set to true
    require_tld: false,
  })
  BACKEND_URL: string;

  @IsUrl({
    // TODO on prod after deployment, set to true
    require_tld: false,
  })
  FRONTEND_URL: string;

  @IsString()
  SETTINGS_ID: string;

  @IsString()
  @IsNotEmpty()
  SUPER_ADMIN_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  SUPER_ADMIN_PASSWORD: string;

  @IsNumber()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  // @IsNumber()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsString()
  REDIS_PORT: string;

  @IsString()
  REDIS_HOST: string;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  @IsOptional()
  REDIS_USERNAME?: string;

  @IsString()
  @IsNotEmpty()
  MAIL_FROM: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TOKEN_EXPIRATION: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_TOKEN_EXPIRATION: string;

  @IsString()
  @IsNotEmpty()
  RESEND_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  FACEBOOK_APP_ID: string;

  @IsString()
  @IsNotEmpty()
  FACEBOOK_APP_SECRET: string;

  @IsString()
  @IsNotEmpty()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  AWS_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  AWS_REGION: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_BUCKET_NAME: string;

  @IsNumber()
  AWS_S3_SIGNED_URL_EXPIRATION_SECONDS: number;

  @IsString()
  @IsNotEmpty()
  PAYSTACK_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  PAYSTACK_BASE_URL: string;

  @IsString()
  @IsNotEmpty()
  MONNIFY_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  MONNIFY_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  MONNIFY_CONTRACT_CODE: string;

  @IsString()
  @IsNotEmpty()
  MONNIFY_BASE_URL: string;

  @IsString()
  @IsNotEmpty()
  FLUTTERWAVE_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  FLUTTERWAVE_CLIENT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  FLUTTERWAVE_ENCRYPTION_KEY: string;

  @IsString()
  @IsNotEmpty()
  FLUTTERWAVE_BASE_URL: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      const constraints = Object.values(error.constraints || {});
      return `${error.property}: ${constraints.join(', ')}`;
    });
    throw new Error(
      `Environment validation failed:\n${errorMessages.join('\n')}`,
    );
  }
  return validatedConfig;
}
