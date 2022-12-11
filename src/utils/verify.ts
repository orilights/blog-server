import { MD5, PBKDF2 } from 'crypto-js';
import * as jwt from 'jsonwebtoken';
import { secret as jwtKey } from 'src/config/jwt';

export function passwordHash(password: string, username: string): string {
  return PBKDF2(password, MD5(username), {
    keySize: 4,
    iterations: 5,
  }).toString();
}

export function verifyToken(token, secret: string = jwtKey): Promise<any> {
  return new Promise((resolve) => {
    jwt.verify(token, secret, (error, payload) => {
      if (error) {
        resolve({ id: -1 });
      } else {
        resolve(payload);
      }
    });
  });
}
