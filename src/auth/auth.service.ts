import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/dasboard/user/entities/user.entity';
import { CreateUserDto } from 'src/dasboard/user/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    private readonly jwtService: JwtService,
  ){}

  async login( loginUserDto: LoginUserDto ){
    const {password,email} = loginUserDto;

    const user = await this.userRepository.findOne({ 
      where: { email },
      select: { email:true, password: true, id:true }
     });
     console.log('user: ',user);
     

     if ( !user ) {
      throw new UnauthorizedException('Credentials are not valid (email)')
     }

     if ( !bcrypt.compareSync( password, user.password ) )
     throw new UnauthorizedException('Credentials are not valid (password)')

     return {
      // ...user,
      token:this.getJwtToken( { id:user.id } )
    };
  }

  async checkAuthStatus( user: User){
    
    return {
      ...user,
      token:this.getJwtToken( { id:user.id } )
    };
  }

  async verifyToken(token: string) {

    try {
      const { id } = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      return {
        ok:true,
        token:this.getJwtToken( {id} )
      };
    } catch (error) {
      throw new UnauthorizedException('Token no válido');
    }
  }

  private getJwtToken( payload: JwtPayload ){

    const token = this.jwtService.sign( payload );
    return token;
  }

  private handleDBError( error: any ):never {
    if ( error.code === '23505' ) 
      throw new BadRequestException( error.detail);

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  
  }

}
