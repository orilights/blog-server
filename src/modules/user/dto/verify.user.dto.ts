import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UserVerifyDto {
  @ApiProperty({ example: '1', description: 'uid' })
  @IsNotEmpty({ message: 'uid不能为空' })
  uid: number;

  @ApiProperty({ example: 'token', description: 'token' })
  @IsNotEmpty({ message: 'token不能为空' })
  token: string;
}
