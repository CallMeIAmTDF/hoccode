export function calcHours(startTime: string, endTime: string): string {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    const diffMs = end - start;
    if (diffMs <= 0) return "0 phút";

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours >= 1) {
        if (minutes > 0) {
            return `${hours} giờ ${minutes} phút`;
        }
        return `${hours} giờ`;
    } else {
        return `${minutes} phút`;
    }
}

export function toHHMMDDMMYYYY(dateStr: string) {
    const date = new Date(dateStr)
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${hours}:${minutes} - ${day}/${month}/${year}`
}