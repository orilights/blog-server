import { Role } from '@prisma/client';

export interface UserJwtPayload {
  id: number;
  name: string;
  email: string;
  role: Role;
  sex: string;
}
