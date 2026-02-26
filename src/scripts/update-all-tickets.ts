import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://kidiezyllex:KK38ly92ncUlJ7qI@bengo.5vjwy6h.mongodb.net/?appName=bengo';

const SupportTicketSchema = new mongoose.Schema({
    subject: String,
    content: String,
    status: String,
}, { timestamps: true });

const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema, 'supporttickets');

const vietnameseScenarios = [
    {
        subject: 'Sai lệch giá cước thực tế',
        content: 'Ứng dụng báo giá 50k nhưng tài xế yêu cầu tôi trả thêm 20k tiền phí cầu đường mà không có trong thỏa thuận ban đầu. Nhờ admin giải quyết.',
    },
    {
        subject: 'Tài xế không liên lạc được',
        content: 'Tôi đã đặt xe và tài xế đã nhận đơn nhưng tôi gọi cho tài xế 5 cuộc đều không bắt máy. Đơn hàng đang rất gấp, nhờ hỗ trợ hủy đơn hoặc đổi tài xế.',
    },
    {
        subject: 'Hàng hóa bị ướt do trời mưa',
        content: 'Tài xế vận chuyển hàng trong trời mưa nhưng không che chắn kỹ làm ướt thùng hàng điện tử của tôi. Tôi cần xác minh trách nhiệm bồi thường.',
    },
    {
        subject: 'Không áp dụng được mã giảm giá',
        content: 'Tôi có mã giảm giá "BENGO10" nhưng khi thanh toán ứng dụng báo mã không hợp lệ mặc dù vẫn còn hạn sử dụng.',
    },
    {
        subject: 'Yêu cầu thay đổi địa chỉ giao hàng',
        content: 'Tôi lỡ đặt nhầm địa chỉ giao hàng từ 123 Lê Duẩn sang 456 Nguyễn Văn Linh. Nhờ hỗ trợ báo cho tài xế hoặc cập nhật đơn giúp tôi.',
    },
    {
        subject: 'Tài xế yêu cầu hủy đơn vô lý',
        content: 'Tài xế đến nơi nhưng nói là hàng cồng kềnh quá không chở được và yêu cầu tôi tự hủy đơn. Hàng của tôi đúng kích thước đã khai báo.',
    },
    {
        subject: 'Lỗi định vị trên bản đồ',
        content: 'Bản đồ hiển thị tài xế đang ở rất xa nhưng thực tế tài xế báo đã đến cửa rồi. Lỗi này làm tôi không theo dõi được hành trình.',
    },
    {
        subject: 'Phản hồi về thái độ phục vụ',
        content: 'Tài xế giao hàng rất nhiệt tình, cẩn thận và đến sớm hơn dự kiến. Tôi muốn để lại lời khen ngợi cho tài xế này.',
    },
    {
        subject: 'Mất mát hàng hóa bên trong kiện hàng',
        content: 'Khi nhận hàng, tôi thấy niêm phong bị rách và thiếu một sản phẩm giá trị bên trong. Nhờ trích xuất thông tin để làm việc với tài xế.',
    },
    {
        subject: 'Số dư ví không cập nhật',
        content: 'Tôi vừa nạp 200k vào ví qua ngân hàng, tiền đã trừ nhưng số dư trên app BenGo vẫn là 0đ.',
    },
    {
        subject: 'Yêu cầu xuất hóa đơn VAT',
        content: 'Tôi đặt đơn hàng cho công ty và cần xuất hóa đơn tài chính. Nhờ bộ phận kế toán liên hệ hỗ trợ gửi hóa đơn.',
    },
    {
        subject: 'Khách hàng không nhận hàng',
        content: 'Tài xế báo lại là đã đến điểm giao nhưng gọi khách hàng nhiều lần không nghe máy. Xử lý hàng hoàn trả như thế nào?',
    },
];

async function updateAllTickets() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const tickets = await SupportTicket.find({});
        console.log(`Found ${tickets.length} tickets`);

        let updatedCount = 0;
        for (let i = 0; i < tickets.length; i++) {
            const ticket = tickets[i];
            // Check if the subject looks like a placeholder or English
            if (ticket.subject.toLowerCase().includes('issue #') ||
                ticket.subject.toLowerCase().includes('sample') ||
                ticket.content.toLowerCase().includes('sample support')) {

                const scenario = vietnameseScenarios[updatedCount % vietnameseScenarios.length];

                await SupportTicket.findByIdAndUpdate(ticket._id, {
                    subject: scenario.subject,
                    content: scenario.content,
                });

                console.log(`Updated ticket ${ticket._id}: ${scenario.subject}`);
                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} placeholder tickets to Vietnamese.`);
    } catch (error) {
        console.error('Error updating tickets:', error);
    } finally {
        await mongoose.disconnect();
    }
}

updateAllTickets();
