import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DeletePostDto {
  @ApiProperty({ example: 'token', description: 'token' })
  @IsNotEmpty({ message: 'token不能为空' })
  token: string;

  @ApiProperty({ example: '1', description: '文章ID' })
  @IsNotEmpty({ message: 'pid不能为空' })
  @IsInt({ message: 'pid格式错误' })
  @Type(() => Number)
  pid: number;
}
