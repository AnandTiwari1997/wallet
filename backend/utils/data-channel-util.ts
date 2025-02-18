class DataChannelUtil {
    responseStream: {
        // @ts-ignore
        [key: string]: Response<any, Record<string, any>, number>;
    } = {};
    // @ts-ignore
    register = (key: string, responseStream: Response<any, Record<string, any>, number>) => {
        this.responseStream[key] = responseStream;
    };
    // @ts-ignore
    publish = (key: string, data: { [key: string]: any }) => {
        if (this.responseStream[key]) {
            this.responseStream[key].write(`data: ${JSON.stringify(data)}\n\n`);
            // this.responseStream[key].end();
        }
    };
    deRegister = (key: string) => {
        if (this.responseStream[key]) {
            this.responseStream[key].end();
            delete this.responseStream[key];
        }
    };
}

// @ts-ignore
export const dataChannel = new DataChannelUtil();
