import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResultData } from 'src/type/result';
import { verifyToken } from 'src/utils/verify';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(token) {
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      return ResultData.fail(401, '无效Token');
    }
    if (payload.role != 'ADMIN') {
      return ResultData.fail(403, '当前用户无权进行此操作');
    }
    const userCount = await this.prisma.user.count();
    const postCount = await this.prisma.post.count();
    const commentCount = await this.prisma.comment.count();

    const latestUser = await this.prisma.user.findFirst({
      orderBy: {
        uid: 'desc',
      },
      select: {
        uid: true,
        name: true,
        nickname: true,
        createdAt: true,
      },
    });

    return ResultData.ok({
      userCount,
      postCount,
      commentCount,
      latestUser,
    });
  }

  async getUserList(token: string, page = 1, pageSize = 10) {
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      return ResultData.fail(401, '无效Token');
    }
    if (payload.role != 'ADMIN') {
      return ResultData.fail(403, '当前用户无权进行此操作');
    }

    const count = await this.prisma.user.count();

    const users = await this.prisma.user.findMany({
      skip: pageSize * (page - 1),
      take: pageSize,
      orderBy: {
        uid: 'asc',
      },
      select: {
        uid: true,
        name: true,
        email: true,
        nickname: true,
        sex: true,
        status: true,
        role: true,
        avatar: true,
        createdAt: true,
        loggedAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });
    return ResultData.ok({
      page,
      count,
      users,
    });
  }

  async deleteUserById(token: string, uid: number) {
    // 验证权限
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      return ResultData.fail(401, '无效Token');
    }
    if (payload.role != 'ADMIN') {
      return ResultData.fail(403, '当前用户无权进行此操作');
    }
    // 校验请求
    const userExist = await this.prisma.user.findUnique({
      where: { uid },
    });
    if (!userExist) {
      return ResultData.fail(404, '用户不存在');
    }
    if (userExist.role == 'SYSTEM') {
      return ResultData.fail(403, '无法删除系统用户');
    }
    // 执行操作
    const anonymousUser = await this.prisma.user.findUnique({
      where: {
        name: 'anonymous',
      },
    });
    await this.prisma.post.updateMany({
      where: {
        author: uid,
      },
      data: {
        author: anonymousUser.uid,
      },
    });
    await this.prisma.comment.updateMany({
      where: {
        sender: uid,
      },
      data: {
        sender: anonymousUser.uid,
      },
    });
    await this.prisma.user.delete({
      where: {
        uid,
      },
    });
    return ResultData.ok(null, '删除成功');
  }

  async banUserById(token: string, uid: number, reverse = false) {
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      return ResultData.fail(401, '无效Token');
    }
    if (payload.role != 'ADMIN') {
      return ResultData.fail(403, '当前用户无权进行此操作');
    }
    try {
      await this.prisma.user.update({
        where: {
          uid,
        },
        data: {
          status: reverse ? 0 : 2,
        },
      });
    } catch (err) {
      return ResultData.fail(500, '系统错误');
    }

    return ResultData.ok();
  }

  async getPostList(token: string, page = 1, pageSize = 10) {
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      return ResultData.fail(401, '无效Token');
    }
    if (payload.role != 'ADMIN') {
      return ResultData.fail(403, '当前用户无权进行此操作');
    }

    const count = await this.prisma.post.count();

    const posts = await this.prisma.post.findMany({
      skip: pageSize * (page - 1),
      take: pageSize,
      orderBy: {
        pid: 'asc',
      },
      select: {
        pid: true,
        title: true,
        text: true,
        like: true,
        viewCount: true,
        allowComment: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            uid: true,
            name: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return ResultData.ok({
      page,
      count,
      posts,
    });
  }

  async deletePost(token: string, pid: number) {
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      return ResultData.fail(401, '无效Token');
    }
    if (payload.role != 'ADMIN') {
      return ResultData.fail(403, '当前用户无权进行此操作');
    }

    const postExist = await this.prisma.post.findUnique({
      where: {
        pid,
      },
    });

    if (!postExist) {
      return ResultData.fail(404, '文章不存在');
    }
    try {
      // 删除文章内的评论
      await this.prisma.comment.deleteMany({
        where: {
          pid,
        },
      });
      // 删除文章点赞
      await this.prisma.like.deleteMany({
        where: {
          type: 'POST',
          sid: pid,
        },
      });
      // 删除文章
      await this.prisma.post.delete({
        where: {
          pid,
        },
      });
    } catch (err) {
      return ResultData.fail(500, '系统错误');
    }

    return ResultData.ok('删除成功');
  }

  async editPostComment(token: string, pid: number, allow: boolean) {
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      return ResultData.fail(401, '无效Token');
    }
    if (payload.role != 'ADMIN') {
      return ResultData.fail(403, '当前用户无权进行此操作');
    }

    const postExist = await this.prisma.post.findUnique({
      where: {
        pid,
      },
    });
    if (!postExist) {
      return ResultData.fail(404, '文章不存在');
    }
    await this.prisma.post.update({
      where: {
        pid,
      },
      data: {
        allowComment: allow ? 1 : 0,
      },
    });
    return ResultData.ok(null, '修改文章评论权限成功');
  }

  async getCommentList(token: string, page = 1, pageSize = 10) {
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      return ResultData.fail(401, '无效Token');
    }
    if (payload.role != 'ADMIN') {
      return ResultData.fail(403, '当前用户无权进行此操作');
    }

    const count = await this.prisma.comment.count();

    const comments = await this.prisma.comment.findMany({
      skip: pageSize * (page - 1),
      take: pageSize,
      orderBy: {
        cid: 'asc',
      },
      select: {
        cid: true,
        text: true,
        ip: true,
        agent: true,
        replyTo: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            uid: true,
            name: true,
            nickname: true,
          },
        },
        post: {
          select: {
            pid: true,
            title: true,
          },
        },
      },
    });
    return ResultData.ok({
      page,
      count,
      comments,
    });
  }

  async deleteCommentById(token: string, cid: number) {
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      return ResultData.fail(401, '无效Token');
    }
    if (payload.role != 'ADMIN') {
      return ResultData.fail(403, '当前用户无权进行此操作');
    }

    const commentExist = await this.prisma.comment.findUnique({
      where: { cid },
    });

    if (!commentExist) {
      return ResultData.fail(404, '评论不存在');
    }
    await this.prisma.comment.delete({
      where: { cid },
    });
    return ResultData.ok(null, '删除成功');
  }

  async tagComment(token: string, cid: number, violate = false) {
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      return ResultData.fail(401, '无效Token');
    }
    if (payload.role != 'ADMIN') {
      return ResultData.fail(403, '当前用户无权进行此操作');
    }

    const commentExist = await this.prisma.comment.findUnique({
      where: { cid },
    });

    if (!commentExist) {
      return ResultData.fail(404, '评论不存在');
    }
    await this.prisma.comment.update({
      where: { cid },
      data: {
        status: violate ? 2 : 0,
      },
    });
    return ResultData.ok(null, '修改评论状态成功');
  }
}
