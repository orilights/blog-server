import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @ApiProperty({ example: 'username', description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(5, { message: '用户名长度最少为5位' })
  @MaxLength(12, { message: '用户名长度最多为12位' })
  username: string;

  @ApiProperty({ example: '123456', description: '密码' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度最少为6位' })
  @MaxLength(30, { message: '密码长度最多为36位' })
  password: string;
}
