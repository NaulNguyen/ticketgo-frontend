import { format } from "date-fns";
import { vi } from "date-fns/locale";

export const formatLastMessageTime = (dateString: string) => {
        try {
        if (!dateString) return "";

        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn("Invalid date string received:", dateString);
            return "";
        }

        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

        if (diffInHours < 24) {
            return format(date, "HH:mm");
        } else if (diffInHours < 168) { // 7 days
            return format(date, "EEEE", { locale: vi });
        } else {
            return format(date, "dd/MM/yyyy");
        }
    } catch (error) {
        console.error("Error formatting date:", error);
        return "";
    }
};