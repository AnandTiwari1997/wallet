export class Account {
  id: number;
  accountName: string;
  accountBalance: number;
  initialBalance: number;
  bankAccountNumber?: string = "";
  accountType: string;
  accountIcon?: any = undefined;
  accountBackgroundColor?: string = "red";
  bankAccountType?: string = undefined;
  bank?: number;
  lastSyncedOn?: string;

  constructor(
    id: number,
    accountName: string,
    accountBalance: number,
    initialBalance: number,
    accountType: string,
    accountIcon: any = undefined,
    accountBackgroundColor: string = "",
  ) {
    this.id = id;
    this.accountName = accountName;
    this.accountBalance = accountBalance;
    this.initialBalance = initialBalance;
    this.accountType = accountType;
    this.accountIcon = accountIcon;
    this.accountBackgroundColor = accountBackgroundColor;
  }
}
