/**
 * @interface IEventListener
 * @description Interface for a class that listens for events.
 */
export interface IEventListener {
    /**
     * @method listen
     * @description Starts listening for a specific event.
     * @param {string} eventName - The name of the event to listen for.
     * @returns {void}
     */
    listen: (eventName: string) => void;

    /**
     * @method refresh
     * @description Refreshes the listener for a specific event.
     * @param {string} eventName - The name of the event to refresh.
     * @returns {void}
     */
    refresh: (eventName: string) => void;
}
