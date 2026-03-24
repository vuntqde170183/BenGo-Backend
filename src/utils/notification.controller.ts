import { Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Return all notifications for the logged in user' })
  async getUserNotifications(@Req() req: any) {
    return this.notificationService.getUserNotifications(req.user.id);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Marked as read' })
  async markAsRead(@Param('id') id: string) {
    await this.notificationService.markAsRead(id);
    return { success: true };
  }
}
