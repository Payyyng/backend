import { Controller, Post, Get, Body, Param, Patch, UseGuards, Put} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateAdminDTO } from './dto/update-admin.dto';
@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService){}

    
    @UseGuards(JwtAuthGuard)
    @Post('disable-user-account')
    @ApiBody({ type: String })
    async disableUserAccount(@Body('id') id: string) {
        return this.adminService.disableUserAccount(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('enable-user-account')
    @ApiBody({ type: String })
    async enableUserAccount(@Body('id') id: string) {
        return this.adminService.enableUserAccount(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('users')
    async getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @UseGuards(JwtAuthGuard)
    @Get('transactions')
    async getAllTransactions() {
        return this.adminService.getAllTransactions();
    }

    @UseGuards(JwtAuthGuard)
    @Get('balances')
    async getAllBalances() {
        return this.adminService.getAllBalance();
    }

    @UseGuards(JwtAuthGuard)
    @Get('paypals')
    async getAllPaypals() {
        return this.adminService.getAllPaypals();
    }

    @UseGuards(JwtAuthGuard)
    @Put('admin-constants')
    @ApiBody({type:UpdateAdminDTO})
    updateAdminConstants(@Body() updateAdminConst: UpdateAdminDTO) {
        return this.adminService.updateAdminConstant(updateAdminConst);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    adminConstants() {
        return this.adminService.getAdminConstant();
    }

    @UseGuards(JwtAuthGuard)
    @Get('bank-transfers')
    abankTransfers() {
        return this.adminService.getAllBankTransfers();
    }
}
