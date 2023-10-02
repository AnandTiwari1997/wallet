import json
import os
import re
import sys
import uuid
from datetime import datetime

import pdfplumber
import pandas as pd
from pandas import DataFrame
from py_pdf_parser import tables
from py_pdf_parser.loaders import load_file


class FundProcessor:
    def process(self, file_path, password):
        raise NotImplementedError

    def save(self, file_format="json", file_path=None):
        raise NotImplementedError


class MutualFundProcessor(FundProcessor):

    def __init__(self):
        self.dataItems = []

    def process(self, file_path, password):
        file_path = file_path
        password = password
        final_text = ""
        with pdfplumber.open(file_path, password=password) as pdf:
            for i in range(len(pdf.pages)):
                txt = pdf.pages[i].extract_text()
                final_text = final_text + "\n" + txt
            pdf.close()
        self.extract_text(final_text)

    def extract_text(self, doc_txt):
        # Defining RegEx patterns
        folio_pat = re.compile(r"(^Folio No:\s(\d+\s\/\s\d+))")  # Extracting Folio information
        fund_name = re.compile(r"^(.*?)\bFund\b")  # Extracting Fund Name
        # Extracting Transaction data
        trans_details = re.compile(
            r"(^\d{2}-\w{3}-\d{4})(\s.+?\s(?=[\d(]))([\d\(]+[,.]\d+[.\d\)]+)(\s[\d\(\,\.\)]+)(\s[\d\,\.]+)(\s[\d,\.]+)")
        # Extract latest NAV
        latest_nav = re.compile(r".+INR\s(\d+[.,-]\d+)\s")
        folio = ''
        fun_name = ''
        latest_nav_dict = {}
        for i in doc_txt.splitlines():
            if folio_pat.match(i):
                folio = folio_pat.match(i).group(2)
            if fund_name.match(i):
                fun_name = fund_name.match(i).group(0)
            txt = trans_details.search(i)
            if txt:
                date = txt.group(1)
                description = txt.group(2)
                amount = txt.group(3)
                units = txt.group(4)
                price = txt.group(5)
                unit_bal = txt.group(6)
                self.dataItems.append([str(uuid.uuid4()), folio, fun_name, date, description, amount, price, units,
                                       unit_bal, 0])
            if latest_nav.match(i):
                latest_nav_dict[fun_name] = latest_nav.match(i).group(1).replace(",", "")
                
        for item in self.dataItems:
            item.append(latest_nav_dict[item[2]])

    def save(self, file_format="json", file_path=None):
        df = DataFrame(self.dataItems,
                       columns=["transactionId", "portfolioNumber", "fundName", "transactionDate", "description",
                                "amount", "nav", "units", "Unit_balance", "latest_nav"])
        clean_txt(df.amount)
        clean_txt(df.units)
        clean_txt(df.nav)
        clean_txt(df.Unit_balance)
        clean_txt(df.latest_nav)

        df.transactionDate = pd.to_datetime(df.transactionDate, dayfirst=True)
        df.transactionDate = df.transactionDate.dt.strftime('%d-%b-%Y')
        df.amount = df.amount.astype('float')
        df.units = df.units.astype('float')
        df.nav = df.nav.astype('float')
        df.Unit_balance = df.Unit_balance.astype('float')
        df.latest_nav = df.latest_nav.astype('float')

        if file_format == "json":
            save_to_json(df, file_path)
        else:
            save_to_csv(df, file_path)


class ProvidentFundProcessor(FundProcessor):

    def __init__(self):
        self.header = None
        self.data = None

    def process(self, file_path, password):
        la_param = {
            "word_margin": 0.15,
            "char_margin": 0.5
        }
        document = load_file(file_path, la_params=la_param)

        element_wage_month = document.elements.filter_by_text_contains("Wage Month").extract_single_element()
        first_row_in_section = document.elements.below(element_wage_month)[0]
        last_row_in_section = document.elements.filter_by_text_contains("Total Contributions for the year"
                                                                        ).extract_single_element()
        element_financial_year = document.elements.filter_by_regex(r".+([0-9]{4}-[0-9]{4}).+")[0]
        financial_year = re.compile(r".+([0-9]{4}-[0-9]{4}).+").match(element_financial_year.text()).group(1)
        table_header_section = document.sectioning.create_section("Table_Header", first_row_in_section,
                                                                  last_row_in_section, include_last_element=False)
        output_table = tables.extract_table(table_header_section.elements, as_text=True,
                                            fix_element_in_multiple_rows=True, fix_element_in_multiple_cols=True)

        self.data = output_table[1:]
        for row in self.data:
            row[3] = re.sub(r'\([^()]*\)', '', row[3])
            row.append(financial_year)
            row.append(str(uuid.uuid4()))

        self.header = ["wageMonth", "transactionDate", "transactionType", "description", "epfAmount", "epsAmount",
                       "employeeContribution", "employerContribution", "pensionAmount", "financialYear",
                       "transactionId"]

    def save(self, file_format="json", file_path=None):
        df = DataFrame(self.data, columns=self.header)

        clean_txt(df.epfAmount)
        clean_txt(df.epsAmount)
        clean_txt(df.employeeContribution)
        clean_txt(df.employerContribution)
        clean_txt(df.pensionAmount)

        df.transactionDate = pd.to_datetime(df.transactionDate, dayfirst=True)
        df.transactionDate = df.transactionDate.dt.strftime('%d-%b-%Y')
        df.epfAmount = df.epfAmount.astype('float')
        df.epsAmount = df.epsAmount.astype('float')
        df.employeeContribution = df.employeeContribution.astype('float')
        df.employerContribution = df.employerContribution.astype('float')
        df.pensionAmount = df.pensionAmount.astype('float')
        # df.description = df.description.replace(r'\([^()]*\)', '')

        if file_format == "json":
            save_to_json(df, file_path)
        else:
            save_to_csv(df, file_path)


def save_to_json(df, file_path=None):
    file_name = f'CAMS_data_{datetime.now().strftime("%d_%m_%Y_%H_%M")}.json'
    save_file = os.path.join(os.path.expanduser('~'), 'Downloads/reports', file_name)
    if file_path:
        save_file = file_path
    try:
        df.to_json(save_file, orient="records")
#         print(f'File {save_file} saved.')
    except Exception as e:
        print(e)


def save_to_csv(df, file_path=None):
    file_name = f'CAMS_data_{datetime.now().strftime("%d_%m_%Y_%H_%M")}.csv'
    save_file = os.path.join(os.path.expanduser('~'), 'Downloads/reports', file_name)
    if file_path:
        save_file = file_path
    try:
        df.to_csv(save_file, index=False)
#         print(f'File {save_file} saved.')
    except Exception as e:
        print(e)


def clean_txt(x):
    x.replace(r",", "", inplace=True, regex=True)
    x.replace("\(", "-", regex=True, inplace=True)
    x.replace("\)", " ", regex=True, inplace=True)
    return x


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    processor_type = sys.argv[1]
    input_file = sys.argv[2]
    output_file = sys.argv[3]
#     print(f'Input File {input_file}')
#     print(f'Output File {input_file}')
    if processor_type == "mutual_fund":
        mutual_fund = MutualFundProcessor()
    else:
        mutual_fund = ProvidentFundProcessor()
    mutual_fund.process(input_file, "Anand@1997")
    mutual_fund.save(file_path=output_file)
    with open(output_file, 'r') as file:
        json_data = json.load(file)
    print("Done.")
