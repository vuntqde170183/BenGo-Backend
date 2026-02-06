import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  UpdateDriverStatusDto,
  ReportsResponseDto,
  UpdatePricingDto,
  UserListResponseDto,
  CreateUserDto,
  UpdateOrderStatusDto,
  UpdateUserRoleDto,
  UpdateUserDto,
} from './dto/admin.dto';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { createApiResponse } from '../utils/response.util';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SpecialOrderResponseDto } from '../dispatcher/dto/dispatcher.dto';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // ============= QUẢN LÝ NGƯỜI DÙNG =============
  @Get('users')
  @ApiOperation({
    summary: '[ADMIN] Lấy danh sách người dùng',
    description: 'API lấy danh sách tất cả người dùng trong hệ thống với phân trang và bộ lọc. Có thể lọc theo vai trò và tìm kiếm theo tên, số điện thoại, email.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách người dùng thành công',
    type: UserListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async getUsers(
    @Query('role') role: string,
    @Query('search') search: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<UserListResponseDto> {
    return this.adminService.getUsers(role, search, page, limit);
  }

  @Get('users/:id')
  @ApiOperation({
    summary: '[ADMIN] Lấy thông tin chi tiết người dùng',
    description: 'API lấy thông tin chi tiết của một người dùng cụ thể theo ID.'
  })
  @ApiResponse({ status: 200, description: 'Lấy thông tin người dùng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async getUserById(@Param('id') id: string): Promise<any> {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/block')
  @ApiOperation({
    summary: '[ADMIN] Khóa/Mở khóa tài khoản người dùng',
    description: 'API khóa hoặc mở khóa tài khoản người dùng. Có thể thêm lý do khi khóa tài khoản.'
  })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái khóa tài khoản thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async blockUser(
    @Param('id') id: string,
    @Body() body: { blocked: boolean; reason?: string },
  ): Promise<any> {
    await this.adminService.blockUser(id, body.blocked, body.reason);
    return createApiResponse(null, 'User block status updated successfully');
  }

  @Delete('users/:id')
  @ApiOperation({
    summary: '[ADMIN] Xóa người dùng',
    description: 'API xóa vĩnh viễn một người dùng khỏi hệ thống. Thao tác này không thể hoàn tác.'
  })
  @ApiResponse({ status: 200, description: 'Xóa người dùng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async deleteUser(@Param('id') id: string): Promise<any> {
    await this.adminService.deleteUser(id);
    return createApiResponse(null, 'User deleted successfully');
  }

  @Put('users/:id')
  @ApiOperation({
    summary: '[ADMIN] Cập nhật thông tin người dùng',
    description: 'API cập nhật thông tin cơ bản của người dùng (tên, email, số điện thoại, avatar, số dư ví).'
  })
  @ApiResponse({ status: 200, description: 'Cập nhật thông tin thành công' })
  @ApiResponse({ status: 400, description: 'Email hoặc số điện thoại đã được sử dụng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<any> {
    return this.adminService.updateUser(id, dto);
  }

  @Post('users')
  @ApiOperation({
    summary: '[ADMIN] Tạo người dùng mới',
    description: 'API tạo một người dùng mới (Customer, Driver, Admin, Dispatcher) bởi Admin.'
  })
  @ApiResponse({ status: 201, description: 'Tạo người dùng thành công' })
  @ApiResponse({ status: 400, description: 'Email hoặc số điện thoại đã tồn tại' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async createUser(@Body() dto: CreateUserDto): Promise<any> {
    const user = await this.adminService.createUser(dto);
    return createApiResponse(user, 'User created successfully', 201);
  }

  @Put('users/:id/role')
  @ApiOperation({
    summary: '[ADMIN] Phân quyền người dùng',
    description: 'API cập nhật vai trò (role) của người dùng. Khi chuyển sang DRIVER cần cung cấp thông tin xe. Khi chuyển từ DRIVER sang role khác, hồ sơ driver sẽ bị xóa.'
  })
  @ApiResponse({ status: 200, description: 'Cập nhật vai trò thành công' })
  @ApiResponse({ status: 400, description: 'Thiếu thông tin bắt buộc khi chuyển sang DRIVER' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<any> {
    return this.adminService.updateUserRole(id, dto.role, dto.driverProfile, dto.reason);
  }

  // ============= QUẢN LÝ TÀI XẾ =============
  @Get('drivers')
  @ApiOperation({
    summary: '[ADMIN] Lấy danh sách tài xế',
    description: 'API lấy danh sách tất cả tài xế trong hệ thống. Có thể lọc theo trạng thái (PENDING, APPROVED, LOCKED).'
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách tài xế thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async getAllDrivers(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<any> {
    return this.adminService.getAllDrivers(status, page, limit);
  }

  @Put('drivers/status')
  @ApiOperation({
    summary: '[ADMIN] Cập nhật trạng thái tài xế',
    description: 'API cập nhật trạng thái tài xế: APPROVED (đã duyệt), PENDING (chờ duyệt), LOCKED (đã khóa), REJECTED (từ chối). Bắt buộc phải có lý do khi REJECT hoặc LOCK tài xế.'
  })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái tài xế thành công' })
  @ApiResponse({ status: 400, description: 'Thiếu lý do khi từ chối hoặc khóa tài xế' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài xế' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async updateDriverStatus(
    @Body() dto: UpdateDriverStatusDto,
  ): Promise<any> {
    await this.adminService.updateDriverStatus(dto);
    return createApiResponse(null, 'Cập nhật trạng thái tài xế thành công');
  }

  @Delete('drivers/:id')
  @ApiOperation({
    summary: '[ADMIN] Xóa tài xế',
    description: 'API xóa vĩnh viễn một tài xế và tài khoản người dùng tương ứng.'
  })
  @ApiResponse({ status: 200, description: 'Xóa tài xế thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài xế' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async deleteDriver(@Param('id') id: string): Promise<any> {
    await this.adminService.deleteDriver(id);
    return createApiResponse(null, 'Driver deleted successfully');
  }

  // ============= QUẢN LÝ ĐƠN HÀNG =============
  @Get('orders')
  @ApiOperation({
    summary: '[ADMIN] Lấy danh sách đơn hàng',
    description: 'API lấy danh sách tất cả đơn hàng trong hệ thống với phân trang. Có thể lọc theo trạng thái đơn hàng.'
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách đơn hàng thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async getAllOrders(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<any> {
    return this.adminService.getAllOrders(status, page, limit);
  }

  @Get('orders/special')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DISPATCHER')
  @ApiOperation({
    summary: '[ADMIN/DISPATCHER] Lấy danh sách chuyến đi đặc biệt',
    description: 'API lấy danh sách các đơn hàng có mức độ ưu tiên đặc biệt (VIP, URGENT, FRAGILE).'
  })
  @ApiResponse({ status: 200, type: [SpecialOrderResponseDto] })
  async getSpecialOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<any> {
    return this.adminService.getSpecialOrders(Number(page), Number(limit));
  }

  @Get('orders/:id')
  @ApiOperation({
    summary: '[ADMIN] Lấy thông tin chi tiết đơn hàng',
    description: 'API lấy thông tin chi tiết của một đơn hàng cụ thể, bao gồm thông tin khách hàng, tài xế, và trạng thái đơn hàng.'
  })
  @ApiResponse({ status: 200, description: 'Lấy thông tin đơn hàng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async getOrderById(@Param('id') id: string): Promise<any> {
    return this.adminService.getOrderById(id);
  }

  @Put('orders/:id/cancel')
  @ApiOperation({
    summary: '[ADMIN] Bắt buộc hủy đơn hàng',
    description: 'API cho phép admin bắt buộc hủy một đơn hàng vì lý do cụ thể. Thường dùng trong trường hợp khẩn cấp.'
  })
  @ApiResponse({ status: 200, description: 'Hủy đơn hàng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async forceCancelOrder(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ): Promise<any> {
    await this.adminService.forceCancelOrder(id, body.reason);
    return createApiResponse(null, 'Order cancelled successfully');
  }

  @Put('orders/:id/status')
  @ApiOperation({
    summary: '[ADMIN] Cập nhật trạng thái đơn hàng & thanh toán',
    description: 'API cho phép admin cập nhật trạng thái đơn hàng (PENDING, ACCEPTED,...) và trạng thái thanh toán (UNPAID, PAID).'
  })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<any> {
    await this.adminService.updateOrderStatus(id, dto);
    return createApiResponse(null, 'Cập nhật trạng thái đơn hàng thành công');
  }

  // ============= CẤU HÌNH GIÁ CƯỚC =============
  @Get('pricing')
  @ApiOperation({
    summary: '[ADMIN] Lấy cấu hình giá cước',
    description: 'API lấy thông tin cấu hình giá cước hiện tại cho các loại xe (BIKE, VAN, TRUCK).'
  })
  @ApiResponse({ status: 200, description: 'Lấy cấu hình giá cước thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async getPricing(): Promise<any> {
    return this.adminService.getPricing();
  }

  @Put('pricing/:vehicleType?')
  @ApiOperation({
    summary: '[ADMIN] Cập nhật cấu hình giá cước',
    description: 'API cập nhật giá cước cho một loại xe cụ thể hoặc tất cả các loại xe.'
  })
  @ApiResponse({ status: 200, description: 'Cập nhật giá cước thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async updatePricing(
    @Param('vehicleType') vehicleType: string,
    @Body() dto: UpdatePricingDto,
  ): Promise<any> {
    await this.adminService.updatePricing(dto, vehicleType);
    return createApiResponse(null, 'Pricing updated successfully');
  }

  // ============= QUẢN LÝ KHUYẾN MÃI =============
  @Get('promotions')
  @ApiOperation({
    summary: '[ADMIN] Lấy danh sách khuyến mãi',
    description: 'API lấy danh sách các chương trình khuyến mãi. Lọc theo trạng thái: ACTIVE (còn hạn & lượt), INACTIVE (hết hạn hoặc hết lượt hoặc bị tắt), EXPIRED (hết hạn), USAGE_LIMIT (hết lượt).'
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách khuyến mãi thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async getAllPromotions(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<any> {
    return this.adminService.getAllPromotions(status, search, page, limit);
  }

  @Post('promotions')
  @ApiOperation({
    summary: '[ADMIN] Tạo chương trình khuyến mãi mới',
    description: 'API tạo mới một chương trình khuyến mãi với mã giảm giá, phần trăm giảm, và thời gian hiệu lực.'
  })
  @ApiResponse({ status: 201, description: 'Tạo khuyến mãi thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async createPromotion(
    @Body() dto: CreatePromotionDto,
  ): Promise<any> {
    const promotion = await this.adminService.createPromotion(dto);
    return createApiResponse(promotion, 'Promotion created successfully');
  }

  @Put('promotions/:id')
  @ApiOperation({
    summary: '[ADMIN] Cập nhật khuyến mãi',
    description: 'API cập nhật thông tin của một chương trình khuyến mãi đang tồn tại.'
  })
  @ApiResponse({ status: 200, description: 'Cập nhật khuyến mãi thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khuyến mãi' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async updatePromotion(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ): Promise<any> {
    await this.adminService.updatePromotion(id, dto);
    return createApiResponse(null, 'Promotion updated successfully');
  }

  @Delete('promotions/:id')
  @ApiOperation({
    summary: '[ADMIN] Xóa khuyến mãi',
    description: 'API xóa một chương trình khuyến mãi khỏi hệ thống.'
  })
  @ApiResponse({ status: 200, description: 'Xóa khuyến mãi thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khuyến mãi' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async deletePromotion(@Param('id') id: string): Promise<any> {
    await this.adminService.deletePromotion(id);
    return createApiResponse(null, 'Promotion deleted successfully');
  }

  // ============= QUẢN LÝ HỖ TRỢ / KHIẾU NẠI =============
  @Get('tickets')
  @ApiOperation({
    summary: '[ADMIN] Lấy danh sách phiếu hỗ trợ',
    description: 'API lấy danh sách tất cả phiếu hỗ trợ/khiếu nại từ người dùng. Có thể lọc theo trạng thái và độ ưu tiên.'
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách phiếu hỗ trợ thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async getAllTickets(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<any> {
    return this.adminService.getAllTickets(status, priority, page, limit);
  }

  @Get('tickets/:id')
  @ApiOperation({
    summary: '[ADMIN] Lấy thông tin chi tiết phiếu hỗ trợ',
    description: 'API lấy thông tin chi tiết của một phiếu hỗ trợ/khiếu nại, bao gồm thông tin người gửi và người xử lý.'
  })
  @ApiResponse({ status: 200, description: 'Lấy thông tin phiếu hỗ trợ thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phiếu hỗ trợ' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async getTicketById(@Param('id') id: string): Promise<any> {
    return this.adminService.getTicketById(id);
  }

  @Put('tickets/:id/assign')
  @ApiOperation({
    summary: '[ADMIN] Phân công phiếu hỗ trợ cho dispatcher',
    description: 'API phân công một phiếu hỗ trợ cho nhân viên điều phối để xử lý.'
  })
  @ApiResponse({ status: 200, description: 'Phân công phiếu hỗ trợ thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phiếu hỗ trợ' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async assignTicket(
    @Param('id') id: string,
    @Body() body: { assignedTo: string },
  ): Promise<any> {
    await this.adminService.assignTicket(id, body.assignedTo);
    return createApiResponse(null, 'Ticket assigned successfully');
  }

  @Put('tickets/:id/status')
  @ApiOperation({
    summary: '[ADMIN] Cập nhật trạng thái phiếu hỗ trợ',
    description: 'API cập nhật trạng thái xử lý của phiếu hỗ trợ (OPEN, IN_PROGRESS, RESOLVED, CLOSED). Có thể thêm giải pháp khi đóng phiếu.'
  })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái phiếu hỗ trợ thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phiếu hỗ trợ' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() body: { status: string; resolution?: string },
  ): Promise<any> {
    await this.adminService.updateTicketStatus(id, body.status, body.resolution);
    return createApiResponse(null, 'Ticket status updated successfully');
  }

  // ============= BÁO CÁO & THỐNG KÊ =============
  @Get('reports')
  @ApiOperation({
    summary: '[ADMIN] Lấy báo cáo thống kê hệ thống',
    description: 'API lấy báo cáo thống kê về doanh thu, đơn hàng, người dùng theo loại báo cáo (REVENUE, ORDERS, USERS, ALL).'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy báo cáo thống kê thành công',
    type: ReportsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async getReports(
    @Query('type') type: string,
    @Query('period') period: string = 'WEEK',
  ): Promise<ReportsResponseDto> {
    return this.adminService.getReports(type, period);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: '[ADMIN] Tổng quan dashboard',
    description: 'API lấy thông tin tổng quan cho trang dashboard admin, bao gồm số lượng người dùng, tài xế, đơn hàng, doanh thu, và phiếu hỗ trợ chờ xử lý.'
  })
  @ApiResponse({ status: 200, description: 'Lấy thông tin dashboard thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc không có quyền admin' })
  async getDashboard(): Promise<any> {
    return this.adminService.getDashboard();
  }
}
