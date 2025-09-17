/**
 * @interface IScheduler
 * @description Represents a scheduler for a generic type T.
 */
export interface IScheduler<T> {
    /**
     * @method schedule
     * @description Schedules a task to run at a specified interval.
     * @param {number} intervalInMS - The interval in milliseconds at which the task should be executed.
     * @returns {void}
     */
    schedule: (intervalInMS: number) => void;
}
