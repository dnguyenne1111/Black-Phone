import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users') // Bắt buộc phải khớp với tên bảng trong MySQL
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  password?: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}