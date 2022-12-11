import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserGetInfoDto } from './dto/getinfo.user.dto';
import { UserLoginDto } from './dto/login.user.dto';
import { UserRegisterDto } from './dto/register.user.dto';
import { UserVerifyDto } from './dto/verify.user.dto';
import { UserService } from './user.service';

@ApiTags('用户系统')
@Controller('user')
export class UserController {
  constructor(private readonly userSevice: UserService) {}

  @Post('/register')
  register(@Body() params: UserRegisterDto) {
    return this.userSevice.register(params);
  }

  @Post('/login')
  login(@Body() params: UserLoginDto) {
    return this.userSevice.login(params);
  }

  @Post('/verify')
  verify(@Body() params: UserVerifyDto) {
    return this.userSevice.verify(params);
  }

  @Get('/getInfo')
  @ApiQuery({ name: 'uid', description: '用户ID', example: 1 })
  getInfo(@Query() params: UserGetInfoDto) {
    return this.userSevice.getInfo(params);
  }
}
