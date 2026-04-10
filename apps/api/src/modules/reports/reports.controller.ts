import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from 'src/database/entities/user.entity';
import { CreateReportDto } from 'src/modules/reports/dto/create-report.dto';
import { ReportsService } from 'src/modules/reports/reports.service';

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  createReport(@CurrentUser() user: UserEntity, @Body() dto: CreateReportDto) {
    return this.reportsService.createReport(user, dto);
  }

  @Get('me')
  getMyReports(
    @CurrentUser() user: UserEntity,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reportsService.listMyReports(user.id, page, limit);
  }
}
