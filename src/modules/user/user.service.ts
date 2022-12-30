import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResultData } from 'src/type/result';
import { passwordHash, verifyToken } from 'src/utils/verify';
import { UserGetInfoDto } from './dto/getinfo.user.dto';
import { UserLoginDto } from './dto/login.user.dto';
import { UserRegisterDto } from './dto/register.user.dto';
import { UserVerifyDto } from './dto/verify.user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(params: UserRegisterDto) {
    const { username, nickname, password, email, sex } = params;
    const existUser = await this.prisma.user.findUnique({
      where: { name: username },
    });
    if (existUser) {
      return ResultData.fail(-1, '用户名已被使用');
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
      return ResultData.fail(-1, '用户不存在');
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
      return ResultData.fail(-1, '用户名或密码错误');
    }
  }

  async verify(params: UserVerifyDto) {
    const { uid, token } = params;
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      return ResultData.fail(-2, '无效Token');
    }
    if (payload.id != uid) {
      return ResultData.fail(-2, '无效Token');
    }
    return ResultData.ok({ uid }, '验证成功');
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
}
