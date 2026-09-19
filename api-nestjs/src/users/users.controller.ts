import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

// Đổi prefix thành 'auth' để các đường dẫn gọi API sẽ là http://localhost:3000/auth/...
@Controller('auth') 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Nhận dữ liệu POST từ form Đăng ký
  @Post('register')
  register(@Body() body: any) {
    return this.usersService.register(body);
  }

  // Nhận dữ liệu POST từ form Đăng nhập
  @Post('login')
  login(@Body() body: any) {
    return this.usersService.login(body.email, body.password);
  }
}