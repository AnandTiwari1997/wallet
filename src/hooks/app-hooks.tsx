import { useState } from 'react';

type ApiRequest<T, R> = (...args: T | any) => Promise<R>;

function useAPI<T, R>(apiRequest: ApiRequest<T, R>): [ApiRequest<T, R>, boolean] {
    const [loading, setLoading] = useState(false);

    async function getData(...args: T | any): Promise<R> {
        setLoading(true);
        try {
            return await apiRequest(...args);
        } finally {
            setLoading(false);
        }
    }

    return [getData, loading];
}

export default useAPI;
