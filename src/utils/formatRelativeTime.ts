import dayjs from "dayjs";

export const formatRelativeTime = (time: string) => {
    const now = dayjs();
    const messageTime = dayjs(time);
    const diffInHours = now.diff(messageTime, 'hour');
    const diffInDays = now.diff(messageTime, 'day');

    if (diffInHours < 24) {
        if (diffInHours === 0) {
            const diffInMinutes = now.diff(messageTime, 'minute');
            if (diffInMinutes === 0) {
                return 'Vừa xong';
            }
            return `${diffInMinutes} phút trước`;
        }
        return `${diffInHours} giờ trước`;
    } else if (diffInDays === 1) {
        return 'Hôm qua';
    } else if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
    } else {
        return messageTime.format('DD/MM/YYYY');
    }
};