export const formatPrice = (
        originalPrice: string,
        discountedPrice: string | null
    ): string => {
        const price = discountedPrice || originalPrice;
        const number = parseFloat(price);
        if (isNaN(number)) return originalPrice;
        return new Intl.NumberFormat("vi-VN").format(number);
    };