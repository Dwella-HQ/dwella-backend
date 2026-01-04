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
