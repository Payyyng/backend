import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }



// eyJhbGciOiJIUzI1NiJ9.NjNkOTBiODhjYmMyOGQwYmYxNzlmMDM5.69ZaRRfu8dSazyIlfDVefRIludEKn-kROY8rIcIoybI