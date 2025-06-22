export function formatDate(timestamp: string | null | undefined): string {
    // does the date need to be 1-1-1980?
    if (timestamp == undefined || (new Date(timestamp).getTime() < new Date("1/1/1980").getTime())) {
        return '';
    }
    const date = new Date(timestamp);
    return date.toLocaleDateString(); // Format as MM/DD/YYYY or your preferred format
}

export function formatDateTime(timestamp: string | null | undefined): string {
    if (timestamp == undefined || (new Date(timestamp).getTime() < new Date("1/1/1980").getTime())) {
        return '';
    }
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

export function formatTimeAgo(durationNs: number | undefined): string {
    if (durationNs === undefined) {
        return "";
    }
    if (isNaN(durationNs) || durationNs < 0) return 'Invalid duration';

    let seconds = Math.floor(durationNs / 1000000000);
    if (seconds < 60) return `${seconds} Second${seconds !== 1 ? 's' : ''}`;

    let minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} Minute${minutes !== 1 ? 's' : ''}`;

    let hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} Hour${hours !== 1 ? 's' : ''}`;

    let days = Math.floor(hours / 24);
    if (days < 7) return `${days} Day${days !== 1 ? 's' : ''}`;

    // Approximation beyond days can be less precise
    let weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} Week${weeks !== 1 ? 's' : ''}`;

    let months = Math.floor(days / 30); // Approximate
    if (months < 12) return `${months} Month${months !== 1 ? 's' : ''}`;

    let years = Math.floor(days / 365); // Approximate
    return `${years} Year${years !== 1 ? 's' : ''}`;
}