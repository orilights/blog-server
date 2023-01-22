import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResultData } from 'src/type/result';
import { passwordHash, verifyToken } from 'src/utils/verify';
import { UserEditDto } from './dto/edit.user.dto';
import { UserGetInfoDto } from './dto/getinfo.user.dto';
import { UserLoginDto } from './dto/login.user.dto';
import { UserRegisterDto } from './dto/register.user.dto';
import { UserVerifyDto } from './dto/verify.user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(params: UserRegisterDto) {
    const { username, nickname, password, email, sex } = params;
    const usernameExist = await this.prisma.user.findUnique({
      where: { name: username },
    });
    if (usernameExist) {
      return ResultData.fail(400, '用户名已被使用');
    }
    const emailExist = await this.prisma.user.findUnique({
      where: { email },
    });
    if (emailExist) {
      return ResultData.fail(400, '邮箱已被使用');
    }
    const newUser = await this.prisma.user.create({
      data: {
        name: username,
        nickname,
        passwordHash: passwordHash(password, username),
        email,
        sex,
      },
    });
    return ResultData.ok({
      uid: newUser.uid,
      name: newUser.name,
      nickname: newUser.nickname,
      role: newUser.role,
      sex: newUser.sex,
      avatar: newUser.avatar,
    });
  }

  async login(params: UserLoginDto) {
    const { username, password } = params;
    const existUser = await this.prisma.user.findUnique({
      where: { name: username },
    });
    if (!existUser) {
      return ResultData.fail(404, '用户不存在');
    }
    if (existUser.status != 0) {
      return ResultData.fail(401, '用户已被封禁');
    }
    if (existUser.passwordHash == passwordHash(password, username)) {
      return ResultData.ok({
        id: existUser.uid,
        token: this.jwtService.sign({
          id: existUser.uid,
          name: existUser.name,
          email: existUser.email,
          role: existUser.role,
          sex: existUser.sex,
        }),
      });
    } else {
      return ResultData.fail(400, '用户名或密码错误');
    }
  }

  async verify(params: UserVerifyDto) {
    const { uid, token } = params;
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      return ResultData.fail(401, '无效Token');
    }
    if (payload.id != uid) {
      return ResultData.fail(401, '无效Token');
    }
    return ResultData.ok({ uid, role: payload.role }, '验证成功');
  }

  async getInfo(params: UserGetInfoDto) {
    const { uid } = params;
    const userInfo = await this.prisma.user.findUnique({
      where: {
        uid: Number(uid),
      },
      select: {
        uid: true,
        name: true,
        nickname: true,
        sex: true,
        status: true,
        role: true,
        avatar: true,
      },
    });
    if (userInfo) {
      return ResultData.ok({ userInfo });
    } else {
      return ResultData.fail(404, '用户不存在');
    }
  }

  async edit(params: UserEditDto) {
    const { token, nickname, password, avatar } = params;
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      return ResultData.fail(401, '无效Token');
    }
    try {
      if (nickname && nickname !== '') {
        await this.prisma.user.update({
          where: {
            uid: payload.id,
          },
          data: {
            nickname,
          },
        });
      }
      if (password && password !== '') {
        await this.prisma.user.update({
          where: {
            uid: payload.id,
          },
          data: {
            passwordHash: passwordHash(password, payload.name),
          },
        });
      }
      if (avatar && avatar !== '') {
        await this.prisma.user.update({
          where: {
            uid: payload.id,
          },
          data: {
            avatar,
          },
        });
      }
    } catch (err) {
      return ResultData.fail(500, '服务器错误');
    }
    const userInfo = await this.prisma.user.findUnique({
      where: {
        uid: payload.id,
      },
      select: {
        uid: true,
        name: true,
        nickname: true,
        sex: true,
        status: true,
        role: true,
        avatar: true,
      },
    });
    return ResultData.ok(userInfo, '更新成功');
  }
}
