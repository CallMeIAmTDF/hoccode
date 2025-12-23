import {Step} from "react-joyride";

export const learnPageSteps : Step[] = [
    {
        target: 'body',
        placement: 'center',
        title: 'Bước 1/6: Chào mừng',
        content: 'Chào mừng bạn đến với Danh sách thử thách! Hãy cùng khám phá các tính năng giúp bạn chinh phục thế giới lập trình nhé.',
        disableBeacon: true,
    },
    {
        target: '#tour-filters',
        placement: 'bottom',
        title: 'Bước 2/6: Bộ lọc thông minh',
        content: 'Đây là thanh công cụ giúp bạn tìm kiếm và lọc các thử thách theo tiêu đề hoặc cấp độ khó dễ.',
    },
    {
        target: '#tour-random',
        placement: 'bottom',
        title: 'Bước 3/6: Thử thách ngẫu nhiên',
        content: 'Nếu không biết bắt đầu từ đâu, hãy thử nhấn nút "Ngẫu nhiên" để nhận một thử thách bất kỳ để thử sức!',
    },
    {
        target: '#tour-daily',
        placement: 'bottom',
        title: 'Bước 4/6: Bài tập hàng ngày',
        content: 'Đừng quên kiểm tra Thử thách hàng ngày! Nơi để bạn có thể nâng cấp chuỗi hoạt động của mình.',
    },
    {
        target: '#tour-list',
        placement: 'top',
        title: 'Bước 5/6: Danh sách bài tập',
        content: 'Khu vực hiển thị tất cả các bài tập. Bạn có thể theo dõi trạng thái hoàn thành, độ khó và điểm số tại đây.',
    },
    {
        target: '#tour-leaderboard',
        placement: 'left',
        title: 'Bước 6/6: Bảng xếp hạng',
        content: 'Cuối cùng là Bảng xếp hạng - nơi vinh danh những lập trình viên xuất sắc nhất. Hãy cố gắng leo hạng nhé!',
    },
]

export const learnProblemPageSteps : Step[] = [
    {
        target: '#tour-problem-information',
        placement: 'right',
        title: 'Bước 1/6: Thông tin thử thách',
        content: 'Khu vực hiển thị thông tin thử thách, bao gồm tiêu đề, mô tả, ràng buộc, ...',
        disableBeacon: true,
    },
    {
        target: '#tour-hoccodeeditor',
        placement: 'left',
        title: 'Bước 2/6: HocCodeEditor',
        content: 'Khu vực hiển thị code của bạn, bạn có thể lập trình trực tiếp tại đây.',
    },
    {
        target: '#tour-select-language',
        placement: 'left',
        title: 'Bước 3/6: Lựa chọn ngôn ngữ',
        content: 'Khu vực để lựa chọn ngôn ngữ bạn muốn: Java, C++ hoặc Python.',
    },
    {
        target: '#tour-run',
        placement: 'left',
        title: 'Bước 4/6: Chạy thử',
        content: 'Thực hiện chạy thử mã nguồn trước khi nộp để đảm bảo chạy đúng.',
    },
    {
        target: '#tour-submit',
        placement: 'left',
        title: 'Bước 5/6: Nộp bài',
        content: 'Thực hiện đánh giá mã nguồn thông qua test case của hệ thống.',
    },
    {
        target: '#tour-result',
        placement: 'left',
        title: 'Bước 6/6: Kết quả',
        content: 'Nơi hiển thị chi tiết kết quả của những lần chạy, nộp bài.',
    },

]