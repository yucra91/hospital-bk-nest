import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { Auth, GetUser, RawHeaders } from './decorators';

import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { User } from 'src/dasboard/user/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login( loginUserDto );
  }

  @Get('check-status')
  @Auth()
  async checkAuthStatus(
    @GetUser() user: User
    ) 
    {
      console.log('token-user',user);
      return this.authService.checkAuthStatus(user);    
  }

  // @Get('renew')
  // async verifyToken(
  //   @Headers('x-token') token: string
  //   ) {
  //   console.log('valid: ',token);
    
  //     try {
  //     return this.authService.verifyToken(token);
      
  //   } catch (error) {
  //     throw new UnauthorizedException('Token no válido');
  //   }
  // }
  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    // @Req() request: Express.Request,
    @GetUser() user:User,
    @GetUser('email') userEmail:string,
    @RawHeaders() rawHeaders:string[],
  ){
    // console.log( request );
    // console.log({ user });
    
    
    return {
      ok:true,
      msg: 'hola mundo Private',
      user,
      userEmail,
      rawHeaders,

    }
  }

  // @SetMetadata('roles',['admin','super-user'])
  @Get('private2')
  @RoleProtected( ValidRoles.superUser, ValidRoles.user )
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user:User
  ){
    return {
      ok:true,
      user
    }
  }

  @Get('private3')
  @Auth( )
  privateRoute3(
    @GetUser() user:User
  ){
    return {
      ok:true,
      user
    }
  }

}
