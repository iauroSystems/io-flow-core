export class DateUtils {
    beginOfDayTimestamp(timestamp) {
        return timestamp - (timestamp % 86400);
    }
}