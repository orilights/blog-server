import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { PostModule } from './modules/post/post.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [UserModule, PrismaModule, PostModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
