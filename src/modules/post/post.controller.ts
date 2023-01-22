import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { isInt } from 'class-validator';
import { IpAddress } from 'src/utils/request';
import { NewCommentDto } from './dto/new.comment.dto';
import { NewPostDto } from './dto/new.post.dto';
import { PostService } from './post.service';
import { EditPostDto } from './dto/edit.post.dto';
import { DeletePostDto } from './dto/delete.post.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { LikeDto } from './dto/like.dto';
import { ResultData } from 'src/type/result';

@ApiTags('博客系统')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/getList')
  @ApiQuery({ name: 'uid', description: '用户ID', example: 1, required: false })
  @ApiQuery({ name: 'page', description: '页数', example: 1 })
  getList(@Query() params) {
    const { page, uid } = params;
    if (uid) {
      return this.postService.getUserPostList(
        Math.floor(Number(uid) || 0),
        Math.floor(Number(page) || 1),
      );
    } else {
      return this.postService.getPostList(Math.floor(Number(page) || 1));
    }
  }

  @Get('/getHotList')
  getHotList() {
    return this.postService.getHotPostList();
  }

  @Get('/getPost')
  @ApiQuery({ name: 'pid', description: '文章ID', example: 1 })
  getPost(@Query() params) {
    const { pid } = params;
    if (pid === undefined || !isInt(Number(pid))) {
      return ResultData.fail(-1, '无效pid');
    }
    return this.postService.getPost(Number(pid));
  }

  @Post('/newPost')
  newPost(@Body() params: NewPostDto) {
    return this.postService.newPost(params);
  }

  @Post('/editPost')
  editPost(@Body() params: EditPostDto) {
    const { pid } = params;
    if (pid === undefined || !isInt(Number(pid))) {
      return ResultData.fail(-1, '无效pid');
    }
    return this.postService.editPost(params);
  }

  @Post('/deletePost')
  deletePost(@Body() params: DeletePostDto) {
    const { pid } = params;
    if (pid === undefined || !isInt(Number(pid))) {
      return ResultData.fail(-1, '无效pid');
    }
    return this.postService.deletePost(params);
  }

  @Get('/getComment')
  @ApiQuery({ name: 'pid', description: '文章ID', example: 1 })
  getComment(@Query() params) {
    const { pid } = params;
    if (pid === undefined || !isInt(Number(pid))) {
      return ResultData.fail(-1, '无效pid');
    }
    return this.postService.getComment(Number(pid));
  }

  @Post('/newComment')
  newComment(@Body() params: NewCommentDto, @IpAddress() ipAddress) {
    return this.postService.newComment(params, ipAddress);
  }

  @Post('/submitLike')
  submitLike(@Body() params: LikeDto) {
    const { sid } = params;
    if (sid === undefined || !isInt(Number(sid))) {
      return ResultData.fail(-1, '无效sid');
    }
    return this.postService.submitLike(params);
  }

  @Post('/cancelLike')
  cancelLike(@Body() params: LikeDto) {
    const { sid } = params;
    if (sid === undefined || !isInt(Number(sid))) {
      return ResultData.fail(-1, '无效sid');
    }
    return this.postService.cancelLike(params);
  }
}
