import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { expiresIn, secret } from 'src/config/jwt';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [
    PrismaModule,
    JwtModule.register({
      secret,
      signOptions: { expiresIn },
    }),
  ],
})
export class UserModule {}
