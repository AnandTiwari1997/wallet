import os
import re
import sys
import uuid
from datetime import datetime
from typing import Dict
import json

import camelot
import pandas as pd
import pdfplumber
from pandas import DataFrame
from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextBox, LTFigure, LAParams
from py_pdf_parser import tables
from py_pdf_parser.components import PDFDocument
from py_pdf_parser.loaders import load_file, Page, logger


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
                if len(fun_name.split("-")) == 2:
                    fun_name = fun_name.split("-")[1]
            txt = trans_details.search(i)
            if txt:
                date = txt.group(1)
                description = txt.group(2)
                amount = txt.group(3)
                units = txt.group(4)
                price = txt.group(5)
                unit_bal = txt.group(6)
                self.dataItems.append([str(uuid.uuid4()), folio, fun_name, date, description, amount, price, units,
                                       unit_bal])
            if latest_nav.match(i):
                latest_nav_dict[fun_name] = latest_nav.match(i).group(1).replace(",", "")
                
        for item in self.dataItems:
            item.append(latest_nav_dict[item[2]])

    def save(self, file_format="json", file_path=None):
        df = DataFrame(self.dataItems,
                       columns=["transactionId", "portfolioNumber", "fundName", "transactionDate", "description",
                                "amount", "nav", "units", "unitBalance", "latestNav"])
        clean_txt(df.amount)
        clean_txt(df.units)
        clean_txt(df.nav)
        clean_txt(df.unitBalance)
        clean_txt(df.latestNav)

        df.transactionDate = pd.to_datetime(df.transactionDate, dayfirst=True)
        df.transactionDate = df.transactionDate.dt.strftime('%d-%b-%Y')
        df.amount = df.amount.astype('float')
        df.units = df.units.astype('float')
        df.nav = df.nav.astype('float')
        df.unitBalance = df.unitBalance.astype('float')
        df.latestNav = df.latestNav.astype('float')

        if file_format == "json":
            save_to_json(df, file_path)
        else:
            save_to_csv(df, file_path)


class ProvidentFundProcessor(FundProcessor):

    def __init__(self):
        self.header = ["wageMonth", "transactionDate", "transactionType", "description", "epfAmount", "epsAmount",
                       "employeeContribution", "employerContribution", "pensionAmount", "financialYear",
                       "transactionId"]
        self.data = None

#     def process(self, file_path, password):
#         la_param = {
#             "word_margin": 0.15,
#             "char_margin": 0.5
#         }
#         document = load_file(file_path, la_params=la_param)
#
#         element_wage_month = document.elements.filter_by_text_contains("Wage Month").extract_single_element()
#         first_row_in_section = document.elements.below(element_wage_month)[0]
#         last_row_in_section = document.elements.filter_by_text_contains("Total Contributions for the year"
#                                                                         ).extract_single_element()
#         element_financial_year = document.elements.filter_by_regex(r".+([0-9]{4}-[0-9]{4}).+")[0]
#         financial_year = re.compile(r".+([0-9]{4}-[0-9]{4}).+").match(element_financial_year.text()).group(1)
#         table_header_section = document.sectioning.create_section("Table_Header", first_row_in_section,
#                                                                   last_row_in_section, include_last_element=False)
#         output_table = tables.extract_table(table_header_section.elements, as_text=True,
#                                             fix_element_in_multiple_rows=True, fix_element_in_multiple_cols=True)
#
#         self.data = output_table[1:]
#         for row in self.data:
#             row[3] = re.sub(r'\([^()]*\)', '', row[3])
#             row.append(financial_year)
#             row.append(str(uuid.uuid4()))
#
#         self.header = ["wageMonth", "transactionDate", "transactionType", "description", "epfAmount", "epsAmount",
#                        "employeeContribution", "employerContribution", "pensionAmount", "financialYear",
#                        "transactionId"]

    def process(self, file_path, password):
        self.data = []
        document = load_file(file_path)
        element_financial_year = document.elements.filter_by_regex(r".+([0-9]{4}-[0-9]{4}).+")[0]
        financial_year = re.compile(r".+([0-9]{4}-[0-9]{4}).+").match(element_financial_year.text()).group(1)

        tables_: TableList = camelot.read_pdf(file_path, pages='1')
        for table_ in tables_:
            for row in table_.data[4:-5]:
                if len(row[0]) == 0:
                    tokens = row[1].split(' ')
                    row[0] = tokens[0]
                    row[1] = tokens[1]
                row[3] = re.sub(r'\([^()]*\)', '', row[3])
                row[3] = re.sub(r'\n', ' ', row[3])
                row.append(financial_year)
                row.append(str(uuid.uuid4()))
                self.data.append(row)

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


class StockProcessor(FundProcessor):
    def __init__(self, broker_dp_id):
        self.header = ["order_no", "stock_isin", "transaction_date", "transaction_type",
                       "stock_quantity", "stock_transaction_price", "amount"]
        self.data = []
        self.broker_impl_map = {
            '12081600': ZerodhaBrokingStockProcessor(),
            '12088700': NextBillionStockProcessor()
        }
        self.broker_impl = self.broker_impl_map[broker_dp_id]

    def process(self, file_path, password):
        la_params = {
            "boxes_flow": None,
            "word_margin": 0.15,
            "char_margin": 0.5
        }

        pages: Dict[int, Page] = {}
        with open(file_path, "rb") as pdf_file:
            for page in extract_pages(pdf_file, password=password, laparams=LAParams(**la_params)):
                elements = [element for element in page if isinstance(element, LTTextBox)]

                # If all_texts=True then we may get some text from inside figures
                if la_params.get("all_texts"):
                    figures = (element for element in page if isinstance(element, LTFigure))
                    for figure in figures:
                        elements += [
                            element for element in figure if isinstance(element, LTTextBox)
                        ]
                if not elements:
                    logger.warning(
                        f"No elements detected on page {page.pageid}, skipping this page."
                    )
                    continue
                pages[page.pageid] = Page(
                    width=page.width, height=page.height, elements=elements
                )

        pdf_document = PDFDocument(pages=pages, pdf_file_path=file_path)
        self.data = self.broker_impl.process(file_path, password, pdf_document)

    def save(self, file_format="json", file_path=None):
        df = DataFrame(self.data, columns=self.header)

        clean_txt(df.stock_quantity)
        clean_txt(df.stock_transaction_price)
        clean_txt(df.amount)

        df.transaction_date = pd.to_datetime(df.transaction_date, dayfirst=True)
        df.transaction_date = df.transaction_date.dt.strftime('%d-%b-%Y %H:%M:%S')
        df.stock_quantity = df.stock_quantity.astype('float')
        df.stock_transaction_price = df.stock_transaction_price.astype('float')
        df.amount = df.amount.astype('float')

        if file_format == "json":
            save_to_json(df, file_path)
        else:
            save_to_csv(df, file_path)

class NextBillionStockProcessor:

    def process(self, file_path: str, password: str, pdf_document: PDFDocument):
        data = []
        for page in pdf_document.pages:
            is_new_format = len(page.elements.filter_by_text_contains('EQUITY')) > 0
            all_first_column = page.elements.filter_by_text_contains('Order')
            for first_column in all_first_column:
                if 'order no.' not in ' '.join(first_column.text().replace('\n', ' ').lower().split()):
                    continue
                first_row = page.elements.below(first_column)[0]
                skip_row = page.elements.filter_by_text_contains('LCM')
                all_total_elements = page.elements.filter_by_text_contains('Symbol')
                if len(all_total_elements) == 0:
                    all_total_elements = page.elements.filter_by_text_contains('Total')[1:]
                if len(all_total_elements) == 0:
                    break
                if len(all_total_elements) == 1:
                    if 'Net Total' == all_total_elements[0].text():
                        break
                all_trade_date = page.elements.filter_by_text_contains('Trade Date')
                before_date_element = ''
                if len(all_trade_date) > 0:
                    before_date_element = all_trade_date[0]
                if len(all_trade_date) == 0:
                    all_trade_date = page.elements.filter_by_text_contains('Trade date')
                    before_date_element = all_trade_date[0]
                    text = page.elements.after(all_trade_date[0])[0].text()
                    if text == 'Client GSTIN:':
                        for e in page.elements.after(all_trade_date[0]):
                            if re.compile(r'\d{10}').match(e.text()):
                                before_date_element = e
                                break
                if before_date_element:
                    date = page.elements.after(before_date_element)[0]
                index = 0
                for total_element in all_total_elements:
                    if index < len(skip_row) and first_row.text() == skip_row[index].text():
                        order_no = page.elements.below(first_row)[0]
                        if "\n" in order_no.text():
                            first_row = page.elements.after(first_row)[0]
                        else:
                            first_row = order_no
                        index = index + 1
                    below_elements = page.elements.below(total_element)
                    include_last_element = False
                    if len(below_elements) > 0:
                        last_row = below_elements[0]
                    else:
                        last_row = page.elements.after(total_element)[-1]
                        include_last_element = True
                    if not is_new_format and not last_row.text().startswith('Total'):
                        ele = page.elements.before(last_row)
                        for i in reversed(range(len(ele))):
                            e = ele[i]
                            if e.text().startswith('Total Buy'):
                                last_row = e
                                break
                    table_section = pdf_document.sectioning.create_section("table", first_row,
                                                                           last_row, include_last_element=include_last_element)
                    output_table = tables.extract_table(table_section.elements, as_text=True,
                                                        fix_element_in_multiple_rows=True,
                                                        fix_element_in_multiple_cols=True,
                                                        tolerance=20.0)
                    rows = output_table[:-1]
                    last = output_table[-1]
                    if last[0] == 'Total Buy :':
                        rows = output_table[:-2]
                        last = output_table[-2]
                        if len(output_table[-2][0]) == 0:
                            last = output_table[-2][1:]
                    elif len(last[0]) == 0:
                        last = output_table[-2]

                    for row in rows:
                        try:
                            if row[0] == 'Total':
                                continue
                            transaction_type = row[5]
                            stock_quantity = row[6]
                            isin = str(last[0])

                            if len(transaction_type) == 0:
                                if stock_quantity == 'S' or stock_quantity == 'B':
                                    stock_quantity = row[7]
                                if len(stock_quantity) > 0:
                                    if int(stock_quantity) > 0:
                                        transaction_type = 'B'
                                    else:
                                        transaction_type = 'S'

                            if transaction_type == 'NSE' or transaction_type == 'BSE':
                                transaction_type = row[6]
                                stock_quantity = row[7]
                                isin = last[4]

                            if len(isin.split(' ISIN : ')) == 2:
                                isin = isin.split(' ISIN : ')[1].replace('Net', '').strip()

                            order_time = ''
                            for col in row:
                                if ':' in col:
                                    order_time = col
                                    break

                            inner_data = {
                                'order_no': row[0],
                                'stock_isin': isin,
                                'transaction_type': transaction_type,
                                'stock_quantity': stock_quantity,
                                'stock_transaction_price': row[-2],
                                'amount': row[-1],
                                'transaction_date': date.text(True).split("\n")[-1] + ' ' + order_time
                            }
                            print(inner_data)
                            if (len(row[0]) > 0 and len(transaction_type) > 0 and len(stock_quantity) > 0
                                    and len(row[-2]) > 0 and len(isin) > 0 and len(row[-1]) > 0):
                                data.append(inner_data)
                        except Exception as e:
                            print(e)

                    if not is_new_format:
                        elements = page.elements.below(last_row)
                        if len(elements) > 0:
                            first_row = elements[0]
                        else:
                            break
                    else:
                        first_row = last_row
                    if first_row.text() == 'Net Total':
                        break
        return data


class ZerodhaBrokingStockProcessor:

    def process(self, file_name: str, password: str, pdf_document: PDFDocument):
        data = []
        all_trade_date = pdf_document.elements.filter_by_text_contains('Trade date')
        if len(all_trade_date) > 0:
            search_result = re.search(r"\d{2}\/\d{2}\/\d{4}", all_trade_date[0].text(True))
        else:
            all_trade_date = pdf_document.elements.filter_by_text_contains('TRADE DATE')
            trade_date = pdf_document.elements.after(all_trade_date[0])[0]
            search_result = re.search(r"\d{2}\/\d{2}\/\d{4}", trade_date.text(True))
        date = None
        if search_result:
            date = search_result.group()
        if date is None:
            date = pdf_document.elements.after(all_trade_date[0])[0].text(True)
        tables_: TableList = camelot.read_pdf(file_name, pages='all', password="AWDPT2993E")
        tables_to_process = []
        for table_ in tables_:
            if 'Order' in table_.data[0][0]:
                tables_to_process.append(table_)
            for row in table_.data[1:]:
                temp_row = row
                row = []
                for i, item in enumerate(temp_row):
                    if i == 0:
                        if len(item) != 16 and len(item) != 19:
                            tokens = item.split('\n')
                            for token in tokens:
                                row.append(token)
                        else:
                            if len(item) > 0:
                                row.append(item)
                    else:
                        if len(item) > 0:
                            row.append(item)
                if len(row) < 11:
                    continue
                processed_row = []
                stock_isin = ''
                for item in row:
                    try:
                        int(item)
                        processed_row.append(item)
                        continue
                    except:
                        pass
                    try:
                        float(str(item).replace('(', '').replace(')', ''))
                        processed_row.append(str(item).replace('(', '').replace(')', ''))
                        continue
                    except:
                        pass
                    if ':' in item:
                        processed_row.append(item)
                        continue
                    if item == 'S' or item == 'B' or item == 'BSE' or item == 'NSE':
                        processed_row.append(item)
                        continue
                    groups = re.search(r'INE[0-9]{3}\w[0-9]{5}', item.strip())
                    if groups:
                        stock_isin = groups.group()

                if len(processed_row) != 10 or len(stock_isin) == 0:
                    continue
                stock_quantity = processed_row[6]
                if processed_row[4] == 'S':
                    stock_quantity = '-' + stock_quantity
                amount: str = processed_row[-1]
                if processed_row[4] == 'B':
                    amount = '-' + amount

                inner_data = {
                    'order_no': processed_row[0],
                    'stock_isin': stock_isin,
                    'transaction_type': processed_row[4],
                    'stock_quantity': stock_quantity,
                    'stock_transaction_price': processed_row[-2],
                    'amount': amount,
                    'transaction_date': date + ' ' + processed_row[1]
                }
                if (len(inner_data['order_no']) > 0 and
                        len(inner_data['stock_isin']) > 0 and
                        len(inner_data['transaction_type']) > 0 and
                        len(inner_data['stock_quantity']) > 0 and
                        len(inner_data['stock_transaction_price']) > 0 and
                        len(inner_data['amount']) > 0):
                    data.append(inner_data)
        return data


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
    password = sys.argv[4]
#     print(f'Input File {input_file}')
#     print(f'Output File {input_file}')
    if processor_type == "mutual_fund":
        mutual_fund = MutualFundProcessor()
        mutual_fund.process(input_file, "Anand@1997")
    elif processor_type == "provident_fund":
        mutual_fund = ProvidentFundProcessor()
        mutual_fund.process(input_file, "Anand@1997")
    else:
        dp_id = processor_type.split("_")[1]
        mutual_fund = StockProcessor(dp_id)
        mutual_fund.process(input_file, "AWDPT2993E")
    mutual_fund.save(file_path=output_file)
    with open(output_file, 'r') as file:
        json_data = json.load(file)
    print("Done.")
