import { format } from "date-fns";
import { vi } from "date-fns/locale";

export const formatLastMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

        if (diffInHours < 24) {
            return format(date, "HH:mm");
        } else if (diffInHours < 168) {
            // 7 days
            return format(date, "EEEE", { locale: vi });
        } else {
            return format(date, "dd/MM/yyyy");
        }
    };