import { bankStorage } from '../storage/bank-storage.js';

export const _getBanks = (req: any, res: any) => {
    bankStorage
        .findAll(req.body.criteria || {})
        .then((banks) => {
            res.send({ results: banks, num_found: banks.length });
        })
        .catch((reason) => {
            res.send({ results: [], num_found: 0 });
        });
};
