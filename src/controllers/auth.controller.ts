import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Request } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AuthGuard } from '../guards/auth.guard';

@Controller('api/auth')
export class AuthController {
  private readonly adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
  private readonly adminPasswordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'password123', 10);
  private readonly jwtSecret = process.env.JWT_SECRET || 'secretKey123!';

  @Post('login')
  async login(@Body() body: any) {
    if (body.email !== this.adminEmail) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(body.password, this.adminPasswordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign({ email: this.adminEmail }, this.jwtSecret, { expiresIn: '12h' });
    return { token };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
