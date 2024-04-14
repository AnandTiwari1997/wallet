export interface IScheduler<T> {
    schedule: (intervalInMS: number) => void;
}
