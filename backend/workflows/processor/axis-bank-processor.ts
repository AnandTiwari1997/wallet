import {
  Category,
  PaymentMode,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../../models/account-transaction.js";
import { ParsedMail } from "mailparser";
import { Logger } from "../../logger/logger.js";
import { BankProcessor } from "./bank-processor.js";

const logger: Logger = new Logger("AxisBankProcessor");

export class AxisBankProcessor implements BankProcessor {
  amountRegex: string[] = ["Rs. (\\d+\\.\\d+)", "INR\\s(\\d+\\.\\d+)"];
  accountNumberRegex = ["A/c\\sno\\.\\s([A-Z0-9]+)"];
  emailId: string = "alerts@axisbank.com";

  process(parsedMail: ParsedMail): Transaction | undefined {
    if (parsedMail.from?.text.includes(this.emailId)) {
      let mailText = parsedMail.text
        ?.replace(/(\r\n|\n|\r)/gm, "")
        .replace(/\s/gm, " ");
      let amount = "";
      let accountNo = "";
      for (const amountR of this.amountRegex) {
        const re = new RegExp(amountR);
        let groups = mailText?.match(re);
        if (groups) {
          amount = groups[1];
          break;
        }
      }
      for (const accountNumber of this.accountNumberRegex) {
        const re = new RegExp(accountNumber);
        let groups = mailText?.match(re);
        if (groups) {
          accountNo = groups[1];
          break;
        }
      }
      let description: string | undefined = parsedMail.text;
      let isDebit: boolean | undefined = parsedMail.text
        ?.toLowerCase()
        .includes("debited");
      if (amount.length > 0) {
        let transaction = new Transaction(
          "",
          0,
          parsedMail.date?.toISOString() || new Date().toISOString(),
          Number.parseFloat(amount),
          Category.OTHER,
          isDebit ? TransactionType.EXPENSE : TransactionType.INCOME,
        );
        transaction.transactionState = TransactionStatus.COMPLETED;
        transaction.paymentMode = parsedMail.text?.includes("UPI")
          ? PaymentMode.MOBILE_TRANSFER
          : PaymentMode.BANK_TRANSFER;
        transaction.note = description;
        return transaction;
      }
    }
    return;
  }
}
