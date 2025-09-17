import { Response } from 'express';

/**
 * @class DataChannelUtil
 * @description A utility class for managing data channels and broadcasting data to clients.
 */
class DataChannelUtil {
    /**
     * @property {Object.<string, Response<any, Record<string, any>, number>>} responseStream
     * @description A dictionary to store response streams, with a unique key for each.
     * @private
     */
    private readonly responseStream: Map<string, Response> = new Map();

    /**
     * @method register
     * @description Registers a new response stream with a given key.
     * @param {string} key - The unique key for the response stream.
     * @param {Response} responseStream - The response stream to register.
     */
    public register(key: string, responseStream: Response) {
        this.responseStream.set(key, responseStream);
    }

    /**
     * @method publish
     * @description Publishes data to a specific response stream using its key.
     * @param {string} key - The key of the response stream to publish to.
     * @param {T} data - The data to be sent.
     */
    public publish<T>(key: string, data: T): void {
        const stream = this.responseStream.get(key);
        if (stream) {
            // The `\n\n` is crucial for the SSE protocol to mark the end of a message.
            stream.write(`data: ${JSON.stringify(data)}\n\n`);
        }
    }

    /**
     * @method deRegister
     * @description De-registers a response stream, closing the connection and removing it from the list.
     * @param {string} key - The key of the response stream to de-register.
     */
    public deRegister(key: string) {
        const stream = this.responseStream.get(key);
        if (stream) {
            stream.end();
            this.responseStream.delete(key);
        }
    }
}

/**
 * @const {DataChannelUtil} dataChannel
 * @description An instance of the DataChannelUtil class, for global access.
 */
// @ts-ignore
export const dataChannel = new DataChannelUtil();
