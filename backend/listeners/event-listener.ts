export interface IEventListener {
    listen: (eventName: string) => void;
    refresh: (eventName: string) => void;
}
