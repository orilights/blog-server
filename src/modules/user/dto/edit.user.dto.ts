import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserEditDto {
  @ApiProperty({ example: 'token', description: 'token' })
  @IsNotEmpty({ message: 'token不能为空' })
  token: string;

  @ApiProperty({ example: 'nickname', description: '新昵称' })
  nickname: string;

  @ApiProperty({ example: '123456', description: '新密码' })
  password: string;

  @ApiProperty({
    example:
      'https://cravatar.cn/avatar/1762718020b76ef1d96d10c00761d2d0?size=100',
    description: '新头像地址',
  })
  avatar: string;
}
