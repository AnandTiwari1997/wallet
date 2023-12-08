import TextBox from '../../modules/text-box/text-box';
import Select, { SelectOption } from '../../modules/select/select';
import { format, parse } from 'date-fns';
import { useState } from 'react';
import { useGlobalLoadingState } from '../../index';
import { DematAccount, Holding, StockTransaction } from '../../data/models';
import { addStockTransaction, getStockHolding } from '../../modules/backend/BackendApi';
import { v4 } from 'uuid';

const AddStockTransaction = ({
    accountMap,
    accountOptions,
    onSubmit
}: {
    accountMap: { [key: string]: DematAccount };
    accountOptions: SelectOption[];
    onSubmit: (success: boolean, data: StockTransaction | undefined) => any | void;
}) => {
    const [stockHoldings, setStockHoldings] = useState<{ [key: string]: Holding }>({});
    const [quantity, setQuantity] = useState<number>(0);
    const [transactionType, setTransactionType] = useState<string>('B');
    const [transactionPrice, setTransactionPrice] = useState<number>(0.0);
    const [transactionDate, setTransactionDate] = useState<string>(format(new Date(), 'dd-MM-yyyy'));
    const [accountId, setAccountId] = useState<string>('');
    const [stockHoldingId, setStockHoldingId] = useState<string>('');
    const [holdingOptions, setHoldingOptions] = useState<SelectOption[]>([]);
    const [state, dispatch] = useGlobalLoadingState();

    return (
        <>
            <div style={{ width: '250px', display: 'flex', justifyContent: 'center' }}>
                <div>
                    <p style={{ margin: '0.5em 0' }}>Account</p>
                    <Select
                        selectedOption={accountId}
                        options={[{ value: '', label: 'Select' }, ...accountOptions]}
                        onChange={(event) => {
                            let accountId = event.target.value;
                            getStockHolding({
                                criteria: {
                                    filters: [
                                        {
                                            key: 'account_id',
                                            value: accountId
                                        }
                                    ]
                                }
                            }).then((apiResponse) => {
                                let options: SelectOption[] = apiResponse.results.map((value) => {
                                    stockHoldings[value.holding_id] = value;
                                    setStockHoldings({ ...stockHoldings });
                                    return { value: value.holding_id, label: value.stock_name };
                                });
                                setHoldingOptions([{ value: '', label: 'Select' }, ...options]);
                            });
                            setAccountId(event.target.value);
                        }}
                    />

                    <p style={{ margin: '0.5em 0' }}>Stock</p>
                    <Select
                        selectedOption={stockHoldingId}
                        options={holdingOptions}
                        onChange={(event) => {
                            setStockHoldingId(event.target.value);
                        }}
                    />

                    <p style={{ margin: '0.5em 0' }}>Stock</p>
                    <Select
                        selectedOption={'B'}
                        options={[
                            { value: 'B', label: 'Buy' },
                            { value: 'S', label: 'Sell' }
                        ]}
                        onChange={(event) => {
                            setTransactionType(event.target.value);
                        }}
                    />

                    <p style={{ margin: '0.5em 0' }}>Quantity</p>
                    <TextBox setValue={setQuantity} value={quantity} placeholder={'Enter Account Bo Id'} />
                    <p style={{ margin: '0.5em 0' }}>Transaction Price</p>
                    <TextBox setValue={setTransactionPrice} value={transactionPrice} placeholder={'Enter Account Name'} />

                    <p>Transaction Date</p>
                    <TextBox setValue={setTransactionDate} value={transactionDate} placeholder={'Enter Loan Start Date in dd-MM-yyyy'} />

                    <div style={{ height: '40px', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                        <button
                            className="button"
                            onClick={() => {
                                let stockQuantity = Number.parseInt(quantity.toString());
                                let price = Number.parseFloat(transactionPrice.toString());
                                let stockTransaction: StockTransaction = {
                                    transaction_id: v4(),
                                    holding: stockHoldings[stockHoldingId],
                                    demat_account: accountMap[accountId],
                                    transaction_date: parse(transactionDate, 'dd-MM-yyyy', new Date()),
                                    transaction_type: transactionType,
                                    stock_quantity: stockQuantity,
                                    stock_transaction_price: price,
                                    amount: price * stockQuantity,
                                    dated: parse(transactionDate, 'dd-MM-yyyy', new Date())
                                };
                                addStockTransaction({ data: stockTransaction })
                                    .then((value) => {
                                        onSubmit(value && value.num_found === 1, value.results[0]);
                                    })
                                    .catch((reason) => {
                                        console.log(reason);
                                        onSubmit(false, undefined);
                                    });
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddStockTransaction;
