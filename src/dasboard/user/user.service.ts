import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { validate as isUUID } from 'uuid';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from 'src/auth/interfaces';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    private readonly jwtService: JwtService,
  ){}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userDate } = createUserDto;

      const user = this.userRepository.create( {
        ...userDate,
        password: bcrypt.hashSync( password, 10 )
      });

      await this.userRepository.save(user);

      return {
        ...user,
        token:this.getJwtToken({ id: user.id})
      };
      
    } catch (error) {
      this.handleDBError( error );      
    }
  }

  findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;
    return this.userRepository.find({
      take:limit,
      skip:offset,
      //TODO
    }); // trae todo
  }

  async findOne(term: string) {
    
    let user: User;
    
    if ( isUUID(term) ) {
      user = await this.userRepository.findOneBy({ id:term });
    }else {
      console.log('term: ',term);
      // user = await this.userRepository.findOneBy({ fullName:term });
      const queryBuilder = this.userRepository.createQueryBuilder();
      user = await queryBuilder
              .where('"fullName" =:fullName', {
                fullName: term,
              }).getOne();
    }

    if ( !user ) throw new NotFoundException(`Usuario con ${term} no encontrado`)

    return user;
  }
  // async findOne(id: string) {

  //   const user = await this.userRepository.findOneBy({id});
  //   if ( !user ) throw new NotFoundException(`Usuario con ${id} no encontrado`)

  //   return user;
  // }

  async update(id: string, updateUserDto: UpdateUserDto) {

    const user = await this.userRepository.preload({
      id,
      ...updateUserDto
    }); // esto lo prepara

    if ( !user ) throw new NotFoundException(`User con id ${id} no encontrado`);
    
    try {
      
      // await this.userRepository.save( user );
      // return user;
      return this.userRepository.save( user );
    } catch (error) {
      this.handleDBError(error);
    }

  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user)
  }

  private getJwtToken( payload: JwtPayload ){

    const token = this.jwtService.sign( payload );
    return token;
  }

  private handleDBError( error: any ):never {
    if ( error.code === '23505' ) 
      throw new BadRequestException( error.detail);

    console.log(error);

    throw new InternalServerErrorException('Error inesperado, revisa los registros del servidor');
  
  }
}
