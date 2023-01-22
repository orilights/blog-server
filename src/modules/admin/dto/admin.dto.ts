import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AdminVerifyOnlyDto {
  @ApiProperty({ example: 'token', description: 'token' })
  @IsNotEmpty({ message: 'token不能为空' })
  token: string;
}

export class AdminCommonListDto {
  @ApiProperty({ example: 'token', description: 'token' })
  @IsNotEmpty({ message: 'token不能为空' })
  token: string;

  @ApiProperty({ example: '1', description: '页数' })
  @IsInt({ message: 'page格式错误' })
  @Type(() => Number)
  page: number;
}

export class AdminUserOpDto {
  @ApiProperty({ example: 'token', description: 'token' })
  @IsNotEmpty({ message: 'token不能为空' })
  token: string;

  @ApiProperty({ example: '1', description: '用户ID' })
  @IsNotEmpty({ message: 'uid不能为空' })
  @IsInt({ message: 'uid格式错误' })
  @Type(() => Number)
  uid: number;
}

export class AdminPostOpDto {
  @ApiProperty({ example: 'token', description: 'token' })
  @IsNotEmpty({ message: 'token不能为空' })
  token: string;

  @ApiProperty({ example: '1', description: '文章ID' })
  @IsNotEmpty({ message: 'pid不能为空' })
  @IsInt({ message: 'pid格式错误' })
  @Type(() => Number)
  pid: number;
}

export class AdminCommentOpDto {
  @ApiProperty({ example: 'token', description: 'token' })
  @IsNotEmpty({ message: 'token不能为空' })
  token: string;

  @ApiProperty({ example: '1', description: '评论ID' })
  @IsNotEmpty({ message: 'cid不能为空' })
  @IsInt({ message: 'cid格式错误' })
  @Type(() => Number)
  cid: number;
}
