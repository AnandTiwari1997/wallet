export class Bank {
  id: number;
  name: string;
  icon: string;
  alertEmailId: string;
  primaryColor: string;

  constructor(
    id: number,
    name: string,
    icon: string,
    alertEmailId: string,
    primaryColor: string,
  ) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.alertEmailId = alertEmailId;
    this.primaryColor = primaryColor;
  }
}
