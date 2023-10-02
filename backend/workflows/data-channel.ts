class DataChannel {
    responseStream: {
        // @ts-ignore
        [key: string]: Response<any, Record<string, any>, number>;
    } = {};
    // @ts-ignore
    register = (key: string, responseStream: Response<any, Record<string, any>, number>) => {
        this.responseStream[key] = responseStream;
    };
    // @ts-ignore
    publish = (key: string, data: { [key: string]: string }) => {
        if (this.responseStream[key]) this.responseStream[key].write(`data: ${JSON.stringify(data)}\n\n`);
    };
    deRegister = (key: string) => {
        if (this.responseStream[key]) {
            this.responseStream[key].end();
            delete this.responseStream[key];
        }
    };
}

// @ts-ignore
export const dataChannel = new DataChannel();
