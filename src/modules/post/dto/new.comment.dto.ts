import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt } from 'class-validator';

export class NewCommentDto {
  @ApiProperty({ example: 'token', description: 'token' })
  @IsNotEmpty({ message: 'token不能为空' })
  token: string;

  @ApiProperty({ example: '1', description: '文章ID' })
  @IsNotEmpty({ message: 'pid不能为空' })
  @IsInt({ message: 'pid格式错误' })
  @Type(() => Number)
  pid: number;

  @ApiProperty({ example: '评论内容', description: '评论内容' })
  @IsNotEmpty({ message: '评论内容不能为空' })
  text: string;

  @ApiProperty({
    example:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.46',
    description: '浏览器UA',
  })
  @IsNotEmpty({ message: '浏览器UA不能为空' })
  agent: string;

  @ApiProperty({ description: '回复的评论ID' })
  replyTo: number;
}
