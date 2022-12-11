import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { verifyToken } from 'src/utils/verify';
import { NewCommentDto } from './dto/new.comment.dto';
import { NewPostDto } from './dto/new.post.dto';
import { EditPostDto } from './dto/edit.post.dto';
import { DeletePostDto } from './dto/delete.post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async getList(page = 1, pageSize = 20) {
    const count = await this.prisma.post.count();

    const posts = await this.prisma.post.findMany({
      skip: pageSize * (page - 1),
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        pid: true,
        title: true,
        text: true,
        like: true,
        viewCount: true,
        allowComment: true,
        createdAt: true,
        user: {
          select: {
            uid: true,
            nickname: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    posts.forEach((value) => {
      if (value.text.length > 100) {
        value.text = value.text.substring(0, 80) + '...';
      }
    });

    return {
      page,
      count,
      posts,
    };
  }

  async getPost(pid: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        pid,
      },
      include: {
        user: {
          select: {
            uid: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });
    if (!post) {
      throw new HttpException('invalid pid', HttpStatus.BAD_REQUEST);
    }
    return { post };
  }

  async newPost(params: NewPostDto) {
    const { token, title, text } = params;
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      throw new HttpException(`invalid token`, HttpStatus.BAD_REQUEST);
    }
    const post = await this.prisma.post.create({
      data: {
        title,
        text,
        author: Number(payload.id),
      },
    });
    return {
      post,
    };
  }

  async editPost(params: EditPostDto) {
    const { token, pid, title, text } = params;
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      throw new HttpException('invalid token', HttpStatus.BAD_REQUEST);
    }
    const postExist = await this.prisma.post.findUnique({
      where: {
        pid: Number(pid),
      },
    });
    if (!postExist) {
      throw new HttpException('invalid pid', HttpStatus.BAD_REQUEST);
    }
    if (postExist.author != Number(payload.id)) {
      throw new HttpException(
        'you have no permission to edit this article',
        HttpStatus.BAD_REQUEST,
      );
    }
    const post = await this.prisma.post.update({
      where: {
        pid: Number(pid),
      },
      data: {
        title,
        text,
      },
    });
    return { post };
  }

  async deletePost(params: DeletePostDto) {
    const { token, pid } = params;
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      throw new HttpException('invalid token', HttpStatus.BAD_REQUEST);
    }
    const postExist = await this.prisma.post.findUnique({
      where: {
        pid: Number(pid),
      },
    });
    if (!postExist) {
      throw new HttpException('invalid pid', HttpStatus.BAD_REQUEST);
    }
    if (postExist.author != Number(payload.id)) {
      throw new HttpException(
        'you have no permission to delete this article',
        HttpStatus.BAD_REQUEST,
      );
    }
    const post = await this.prisma.post.delete({
      where: {
        pid: Number(pid),
      },
    });
    return { post };
  }

  async getComment(pid: number) {
    const comments = await this.prisma.comment.findMany({
      where: {
        pid,
      },
      select: {
        cid: true,
        text: true,
        replyTo: true,
        like: true,
        dislike: true,
        createdAt: true,
        user: {
          select: {
            uid: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { comments };
  }

  async newComment(params: NewCommentDto, ipAddress: string) {
    const { token, pid, text, agent } = params;
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      throw new HttpException(`invalid token`, HttpStatus.BAD_REQUEST);
    }
    const post = await this.prisma.post.findUnique({
      where: {
        pid: Number(pid),
      },
    });
    if (!post) {
      throw new HttpException(`invalid pid`, HttpStatus.BAD_REQUEST);
    }
    const comment = await this.prisma.comment.create({
      data: {
        pid: Number(pid),
        sender: Number(payload.id),
        text: text,
        ip: String(ipAddress),
        agent: agent,
      },
    });

    return {
      comment,
    };
  }
}
