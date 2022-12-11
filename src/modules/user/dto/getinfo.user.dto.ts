import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserGetInfoDto {
  @ApiProperty({ example: 'uid', description: 'User ID' })
  @IsNotEmpty({ message: 'uid不能为空' })
  @IsInt({ message: 'uid格式错误' })
  @Type(() => Number)
  uid: number;
}
