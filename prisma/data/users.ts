import { Role } from '@prisma/client';

export const users = [
  {
    username: 'dionatsir',
    name: 'Dio',
    role: 'ADMIN' as Role,
    password: '123123',
  },
  {
    username: 'stein',
    name: 'Stein',
    role: 'USER' as Role,
    password: '123123',
  },
];
