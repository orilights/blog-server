import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { verifyToken } from 'src/utils/verify';
import { NewCommentDto } from './dto/new.comment.dto';
import { NewPostDto } from './dto/new.post.dto';
import { EditPostDto } from './dto/edit.post.dto';
import { DeletePostDto } from './dto/delete.post.dto';
import { LikeDto } from './dto/like.dto';
import { ResultData } from 'src/type/result';
import { UserJwtPayload } from 'src/type/interface';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async getPostList(page = 1, pageSize = 10) {
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

    return ResultData.ok({
      page,
      count,
      posts,
    });
  }

  async getUserPostList(uid, page = 1, pageSize = 10) {
    const user = await this.prisma.user.findUnique({
      where: {
        uid: uid,
      },
    });
    if (!user) {
      return ResultData.fail(404, '用户不存在');
    }
    const count = (
      await this.prisma.post.findMany({
        where: {
          author: user.uid,
        },
      })
    ).length;
    const posts = await this.prisma.post.findMany({
      where: {
        author: user.uid,
      },
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

    return ResultData.ok({
      page,
      count,
      posts,
    });
  }

  async getHotPostList() {
    const posts = await this.prisma.post.findMany({
      take: 20,
      orderBy: {
        viewCount: 'desc',
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

    return ResultData.ok({
      posts,
    });
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
      return ResultData.fail(404, '文章不存在');
    }
    return ResultData.ok({ post });
  }

  async newPost(params: NewPostDto) {
    const { token, title, text } = params;
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      ResultData.fail(401, '无效Token');
    }
    const post = await this.prisma.post.create({
      data: {
        title,
        text,
        author: Number(payload.id),
      },
    });
    return ResultData.ok({ post });
  }

  async editPost(params: EditPostDto) {
    const { token, pid, title, text } = params;
    const payload: UserJwtPayload = await verifyToken(token);
    if (payload.id == -1) {
      ResultData.fail(401, '无效Token');
    }
    const postExist = await this.prisma.post.findUnique({
      where: {
        pid: Number(pid),
      },
    });
    if (!postExist) {
      return ResultData.fail(404, '文章不存在');
    }
    if (postExist.author != payload.id) {
      ResultData.fail(403, '你没有权限编辑这篇文章');
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
    return ResultData.ok({ post });
  }

  async deletePost(params: DeletePostDto) {
    const { token, pid } = params;
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      ResultData.fail(401, '无效Token');
    }
    const postExist = await this.prisma.post.findUnique({
      where: {
        pid: Number(pid),
      },
    });
    if (!postExist) {
      return ResultData.fail(404, '文章不存在');
    }
    if (postExist.author != Number(payload.id)) {
      return ResultData.fail(403, '你没有权限删除这篇文章');
    }
    const post = await this.prisma.post.delete({
      where: {
        pid: Number(pid),
      },
    });
    return ResultData.ok({ post });
  }

  async countPostView(pid: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        pid,
      },
    });
    if (!post) {
      return ResultData.fail(404, '文章不存在');
    }
    await this.prisma.post.update({
      where: {
        pid,
      },
      data: {
        viewCount: post.viewCount + 1,
      },
    });
    return ResultData.ok();
  }

  async getComment(pid: number) {
    const comments = await this.prisma.comment.findMany({
      where: {
        pid,
        status: 0,
      },
      select: {
        cid: true,
        text: true,
        replyTo: true,
        like: true,
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
    return ResultData.ok({ comments });
  }

  async newComment(params: NewCommentDto, ipAddress: string) {
    const { token, pid, text, agent, replyTo } = params;
    const payload: UserJwtPayload = await verifyToken(token);
    if (payload.id == -1) {
      ResultData.fail(401, '无效Token');
    }
    const post = await this.prisma.post.findUnique({
      where: {
        pid: Number(pid),
      },
    });
    if (!post) {
      return ResultData.fail(404, '文章不存在');
    }
    if (post.allowComment !== 1) {
      // 禁止普通用户在关闭的评论区留言
      if (payload.role === 'USER') {
        return ResultData.fail(403, '评论区已关闭');
      }
    }
    const comment = await this.prisma.comment.create({
      data: {
        pid: Number(pid),
        sender: payload.id,
        text: text,
        ip: String(ipAddress),
        agent: agent,
        replyTo: replyTo || null,
      },
    });

    return ResultData.ok({
      comment,
    });
  }

  async submitLike(params: LikeDto) {
    const { token, type, sid } = params;
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      ResultData.fail(401, '无效Token');
    }
    let sidExist;
    if (type == 'POST') {
      sidExist = await this.prisma.post.findUnique({
        where: {
          pid: sid,
        },
      });
    } else if (type == 'COMMENT') {
      sidExist = await this.prisma.comment.findUnique({
        where: {
          cid: sid,
        },
      });
    } else {
      return ResultData.fail(400, '无效点赞类型');
    }
    if (!sidExist) {
      return ResultData.fail(400, '无效sid');
    }
    const likeExist = await this.prisma.like.findFirst({
      where: {
        type,
        sid,
        uid: payload.id,
      },
    });
    if (likeExist) {
      return ResultData.fail(400, '已点赞过');
    }
    const like = await this.prisma.like.create({
      data: {
        type,
        sid,
        uid: payload.id,
      },
    });
    if (type == 'POST') {
      await this.prisma.post.update({
        where: {
          pid: sid,
        },
        data: {
          like: sidExist.like + 1,
        },
      });
    }
    if (type == 'COMMENT') {
      await this.prisma.comment.update({
        where: {
          cid: sid,
        },
        data: {
          like: sidExist.like + 1,
        },
      });
    }
    return ResultData.ok({ id: like.id });
  }

  async cancelLike(params: LikeDto) {
    const { token, type, sid } = params;
    // 校验 token
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      ResultData.fail(401, '无效Token');
    }
    // 校验点赞对象
    let sidExist;
    if (type == 'POST') {
      sidExist = await this.prisma.post.findUnique({
        where: {
          pid: sid,
        },
      });
    } else if (type == 'COMMENT') {
      sidExist = await this.prisma.comment.findUnique({
        where: {
          cid: sid,
        },
      });
    } else {
      return ResultData.fail(400, '无效点赞类型');
    }
    if (!sidExist) {
      return ResultData.fail(400, '无效sid');
    }
    // 判断是否已点赞
    const likeExist = await this.prisma.like.findFirst({
      where: {
        type,
        sid,
        uid: payload.id,
      },
    });
    if (!likeExist) {
      return ResultData.fail(400, '点赞不存在');
    }
    // 取消点赞
    await this.prisma.like.delete({
      where: {
        id: likeExist.id,
      },
    });
    if (type == 'POST') {
      await this.prisma.post.update({
        where: {
          pid: sid,
        },
        data: {
          like: sidExist.like - 1,
        },
      });
    }
    if (type == 'COMMENT') {
      await this.prisma.comment.update({
        where: {
          cid: sid,
        },
        data: {
          like: sidExist.like - 1,
        },
      });
    }
    return ResultData.ok();
  }
}
