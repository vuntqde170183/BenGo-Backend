import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://kidiezyllex:KK38ly92ncUlJ7qI@bengo.5vjwy6h.mongodb.net/?appName=bengo';

const SupportTicketSchema = new mongoose.Schema({
    subject: String,
    content: String,
}, { timestamps: true });

const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema, 'supporttickets');

const ticketsToUpdate = [
    {
        id: '694eea3a736c474360b86b81',
        subject: 'Giao hàng trễ hẹn',
        content: 'Đơn hàng của tôi đã quá thời gian dự kiến 30 phút mà tài xế vẫn chưa đến điểm lấy hàng. Tôi cần giao gấp cho khách.',
    },
    {
        id: '694eea3a736c474360b86b85',
        subject: 'Thất lạc hàng hóa',
        content: 'Tôi gửi một kiện hàng quần áo từ Quận 1 sang Quận 3 nhưng người nhận báo chưa nhận được, trong khi ứng dụng báo đã hoàn thành. Nhờ kiểm tra lại thông tin tài xế.',
    },
    {
        id: '694eea3a736c474360b86b89',
        subject: 'Lỗi thanh toán ví điện tử',
        content: 'Tôi đã thanh toán đơn hàng qua ví điện tử và bị trừ tiền, nhưng hệ thống BenGo vẫn báo là Chưa thanh toán (UNPAID).',
    },
    {
        id: '694eea3a736c474360b86b8d',
        subject: 'Thái độ tài xế không đúng mực',
        content: 'Tài xế có thái độ nóng nảy và tranh cãi với tôi khi lấy hàng. Tôi cảm thấy không hài lòng với dịch vụ này.',
    },
    {
        id: '694eea3a736c474360b86b91',
        subject: 'Lỗi ứng dụng khi chọn địa chỉ',
        content: 'Ứng dụng thường xuyên bị treo và văng ra ngoài khi tôi cố gắng tìm kiếm và chọn địa chỉ giao hàng trên bản đồ.',
    },
    {
        id: '694eea3a736c474360b86b95',
        subject: 'Tài xế không di chuyển sau khi nhận đơn',
        content: 'Tài xế đã nhận đơn của tôi hơn 15 phút nhưng vẫn đứng yên một chỗ trên bản đồ. Tôi gọi điện nhiều lần nhưng không bắt máy.',
    },
    {
        id: '694eea3a736c474360b86b99',
        subject: 'Hàng hóa bị hư hỏng khi vận chuyển',
        content: 'Kiện hàng đồ thủy tinh của tôi bị vỡ nát khi đến tay người nhận. Tôi yêu cầu bồi thường thiệt hại theo chính sách bảo hiểm.',
    },
];

async function updateTickets() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        for (const ticket of ticketsToUpdate) {
            const result = await SupportTicket.findByIdAndUpdate(ticket.id, {
                subject: ticket.subject,
                content: ticket.content,
            });
            if (result) {
                console.log(`Updated ticket ${ticket.id} successfully`);
            } else {
                console.log(`Ticket ${ticket.id} not found`);
            }
        }

        console.log('Update process completed');
    } catch (error) {
        console.error('Error updating tickets:', error);
    } finally {
        await mongoose.disconnect();
    }
}

updateTickets();
