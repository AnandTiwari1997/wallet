import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('provident_fund')
export class ProvidentFundTransaction {
    @PrimaryColumn()
    transaction_id: string;

    @Column()
    wage_month: string;

    @CreateDateColumn()
    transaction_date: Date;

    @Column()
    description: string;

    @Column()
    epf_amount: number;

    @Column()
    eps_amount: number;

    @Column()
    employee_contribution: number;

    @Column()
    employer_contribution: number;

    @Column()
    pension_amount: number;

    @Column()
    transaction_type: string;

    @Column()
    financial_year: string;

    constructor(
        transaction_id: string,
        wage_month: string,
        transaction_date: Date,
        description: string,
        epf_amount: number,
        eps_amount: number,
        employee_contribution: number,
        employer_contribution: number,
        pension_amount: number,
        transaction_type: string,
        financial_year: string
    ) {
        this.transaction_id = transaction_id;
        this.wage_month = wage_month;
        this.transaction_date = transaction_date;
        this.description = description;
        this.epf_amount = epf_amount;
        this.eps_amount = eps_amount;
        this.employee_contribution = employee_contribution;
        this.employer_contribution = employer_contribution;
        this.pension_amount = pension_amount;
        this.transaction_type = transaction_type;
        this.financial_year = financial_year;
    }
}
