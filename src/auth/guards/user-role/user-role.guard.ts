import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/dasboard/user/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector:Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRole:string[] = this.reflector.get( META_ROLES, context.getHandler() );

    if ( !validRole ) return true;
    if ( validRole.length === 0 ) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if ( !user )
      throw new BadRequestException('User no found');

    for (const role of user.roles) {
      if ( validRole.includes(role)) return true
    }

    throw new ForbiddenException(`User ${ user.fullName } need a valid role: [${ validRole }]`)

    console.log({userRoler: user.roles});
    
  }
}
