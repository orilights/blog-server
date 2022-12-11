import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class EditPostDto {
  @ApiProperty({ example: 'token', description: 'token' })
  @IsNotEmpty({ message: 'token不能为空' })
  token: string;

  @ApiProperty({ example: '1', description: '文章ID' })
  @IsNotEmpty({ message: 'pid不能为空' })
  @IsInt({ message: 'pid格式错误' })
  @Type(() => Number)
  pid: number;

  @ApiProperty({ example: '文章标题', description: '文章标题' })
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @ApiProperty({ example: '文章内容', description: '文章内容' })
  @IsNotEmpty({ message: '文章内容不能为空' })
  text: string;
}
