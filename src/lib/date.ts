export const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit"
    });
};