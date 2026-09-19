import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // ĐĂNG KÝ (Lưu thẳng mật khẩu không mã hóa)
  async register(userData: any) {
    const existingUser = await this.usersRepository.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new HttpException({ status: 'error', message: 'Email này đã được sử dụng!' }, HttpStatus.BAD_REQUEST);
    }

    const newUser = this.usersRepository.create({
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      password: userData.password, // Lưu trực tiếp chuỗi user nhập vào
    });
    
    await this.usersRepository.save(newUser);
    return { status: 'success', message: 'Đăng ký tài khoản thành công!' };
  }

  // ĐĂNG NHẬP (So sánh chuỗi trực tiếp)
  async login(email: string, pass: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    // So sánh trực tiếp mật khẩu người dùng nhập với mật khẩu trong DB
    if (!user || user.password !== pass) {
      throw new HttpException({ status: 'error', message: 'Sai email hoặc mật khẩu!' }, HttpStatus.UNAUTHORIZED);
    }

    const { password, ...userData } = user;
    return { 
      status: 'success', 
      message: 'Đăng nhập thành công!',
      data: userData 
    };
  }
}