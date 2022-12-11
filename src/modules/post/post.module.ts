import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [PostService],
  controllers: [PostController],
  imports: [PrismaModule],
})
export class PostModule {}
