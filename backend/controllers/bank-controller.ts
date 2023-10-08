import { bankStorage } from '../storage/bank-storage.js';
import { BankDtoBuilder } from '../models/bank.js';

export const _getBanks = (req: any, res: any) => {
    bankStorage
        .findAll(req.body.criteria || {})
        .then((banks) => {
            let results = banks.map((bank) => BankDtoBuilder.build(bank));
            res.send({ results: results, num_found: results.length });
        })
        .catch((reason) => {
            res.send({ results: [], num_found: 0 });
        });
};
