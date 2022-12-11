import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
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
      throw new HttpException(`用户名已使用`, HttpStatus.BAD_REQUEST);
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
    return newUser;
  }

  async login(params: UserLoginDto) {
    const { username, password } = params;
    const existUser = await this.prisma.user.findUnique({
      where: { name: username },
    });
    if (!existUser) {
      throw new HttpException(`用户不存在`, HttpStatus.BAD_REQUEST);
    }
    if (existUser.passwordHash == passwordHash(password, username)) {
      return {
        id: existUser.uid,
        token: this.jwtService.sign({
          id: existUser.uid,
          name: existUser.name,
          email: existUser.email,
          role: existUser.role,
          sex: existUser.sex,
        }),
      };
    } else {
      throw new HttpException(`用户名或密码错误`, HttpStatus.BAD_REQUEST);
    }
  }

  async verify(params: UserVerifyDto) {
    const { uid, token } = params;
    const payload = await verifyToken(token);
    if (payload.id == -1) {
      throw new HttpException(`invalid token`, HttpStatus.BAD_REQUEST);
    }
    if (payload.id != uid) {
      throw new HttpException(`invalid token`, HttpStatus.BAD_REQUEST);
    }
    return {
      uid,
    };
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
        avatar: true,
        posts: {
          select: {
            pid: true,
            title: true,
            text: true,
            like: true,
            viewCount: true,
            allowComment: true,
            createdAt: true,
            _count: {
              select: {
                comments: true,
              },
            },
          },
        },
      },
    });
    if (userInfo) {
      return userInfo;
    } else {
      throw new HttpException(`该用户不存在`, HttpStatus.BAD_REQUEST);
    }
  }
}
