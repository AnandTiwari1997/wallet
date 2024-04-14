export interface ISyncHandler<T> {
    sync: (data: T[], deltaSync: boolean) => void | any | undefined;
}
