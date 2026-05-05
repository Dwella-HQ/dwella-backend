/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

export function isBcryptHash(str: string) {
  const bcryptRegex = /^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/;
  return bcryptRegex.test(str);
}

export const generateRandomString = (length: number = 10) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export function breakDownFullName(fullName: string) {
  const names = fullName.trim().split(' ');
  const firstName = names[0] || '';
  const middleName = names.length > 2 ? names.slice(1, -1).join(' ') : '';
  const lastName = names.length > 1 ? names[names.length - 1] : '';
  return { firstName, middleName, lastName };
}

export function base64Encode(str: string): string {
  return Buffer.from(str).toString('base64');
}

export function base64Decode(base64Str: string): string {
  return Buffer.from(base64Str, 'base64').toString('utf-8');
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount);
}

export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number {
    return parseFloat(data);
  }
}

export function MatchPassword(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'Match',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, string>)[
            relatedPropertyName
          ];
          return value === relatedValue;
        },
      },
    });
  };
}

export function formatHbsText(
  templateName: string,
  context: Record<string, any>,
): string {
  const filePath = path.join(
    process.cwd(),
    'src/templates/text',
    `${templateName}.hbs`,
  );

  const source = fs.readFileSync(filePath, 'utf-8');

  const template = Handlebars.compile(source);

  return template(context);
}

export function camelCaseToSpaced(str: string) {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // handle consecutive caps: XMLParser → XML Parser
    .replace(/([a-z\d])([A-Z])/g, '$1 $2') // handle standard camel: helloWorld → hello World
    .replace(/^./, (match) => match.toUpperCase()) // capitalize first letter
    .trim();
}
