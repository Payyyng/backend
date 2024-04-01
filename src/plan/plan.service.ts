import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}
  create(createPlanDto: CreatePlanDto) {
    return 'This action adds a new plan';
  }

  findAll() {
    return this.prisma.plans.findMany({
      orderBy: {
        id: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.plans.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: string, updatePlanDto: UpdatePlanDto) {
    return this.prisma.plans.update({
      where: {
        id,
      },
      data: <any>{
        ...updatePlanDto,
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} plan`;
  }
}
