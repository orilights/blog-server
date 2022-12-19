import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt, IsEnum } from 'class-validator';

export class LikeDto {
  @ApiProperty({ example: 'token', description: 'token' })
  @IsNotEmpty({ message: 'token不能为空' })
  token: string;

  @ApiProperty({ example: 'POST', description: '点赞类型' })
  @IsNotEmpty({ message: '点赞类型不能为空' })
  @IsEnum(['POST', 'COMMENT'], {
    message: '类型只能是 POST、COMMENT',
  })
  type: string;

  @ApiProperty({ example: '1', description: '点赞关联id' })
  @IsNotEmpty({ message: 'sid不能为空' })
  @IsInt({ message: 'sid格式错误' })
  @Type(() => Number)
  sid: number;
}
