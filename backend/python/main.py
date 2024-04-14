import json
import os
import re
import sys
import uuid
from datetime import datetime, timedelta

import pandas as pd
import pdfplumber
import pytesseract
from PIL.Image import Image
from pandas import DataFrame
import table_ocr

import cv2
import numpy as np
from pdf2image import convert_from_path


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
        isin_pattern_1 = re.compile(r"INF[0-9]{3}\w[0-9]{5}")
        isin_pattern_2 = re.compile(r"INF[0-9]{3}\w[0-9]{2}\w\w\d")
        # Extracting Transaction data
        trans_details = re.compile(
            r"(^\d{2}-\w{3}-\d{4})(\s.+?\s(?=[\d(]))([\d\(]+[,.]\d+[.\d\)]+)(\s[\d\(\,\.\)]+)(\s[\d\,\.]+)(\s[\d,\.]+)")
        # Extract latest NAV
        latest_nav = re.compile(r".+INR\s(\d+[.,-]\d+)\s")
        folio = ''
        fun_name = ''
        isin = ''
        latest_nav_dict = {}
        lines = doc_txt.splitlines()
        for i_, i in enumerate(lines):
            if folio_pat.match(i):
                folio = folio_pat.match(i).group(2)
            if fund_name.match(i):
                fun_name = fund_name.match(i).group(0)
                if len(fun_name.split("-")) == 2:
                    fun_name = fun_name.split("-")[1]
                    search = isin_pattern_1.search(i) or isin_pattern_2.search(i)
                    if search:
                        isin = search.group()
                    elif 'INF' in i:
                        search_1 = re.search(r'[0-9]{3}\w[0-9]{5}', lines[i_ + 1])
                        search_2 = re.search(r'[0-9]{3}\w[0-9]{2}\w\w\d', lines[i_ + 1])
                        isin = 'INF' + (search_1 or search_2).group()

            txt = trans_details.search(i)
            if txt:
                date = txt.group(1)
                description = txt.group(2)
                amount = txt.group(3)
                units = txt.group(4)
                price = txt.group(5)
                unit_bal = txt.group(6)
                self.dataItems.append([str(uuid.uuid4()), folio, fun_name.upper(), date, description, amount, price, units,
                                       unit_bal, isin])
            if latest_nav.match(i):
                latest_nav_dict[isin] = latest_nav.match(i).group(1).replace(",", "")

        for item in self.dataItems:
            item.append(latest_nav_dict[item[-1]])

    def save(self, file_format="json", file_path=None):
        df = DataFrame(self.dataItems,
                       columns=["transactionId", "portfolioNumber", "fundName", "transactionDate", "description",
                                "amount", "nav", "units", "unitBalance", "isin", "latestNav"])
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

    def process(self, file_path, password):
        self.data = []
        images = convert_from_path(file_path)
        tables = get_tables(get_cv2_image(images[0]), 60, 1e4)
        rows = get_cells(tables[0], 60, 40, 20)
        date = re.search(r'\d+/\d+/\d+', get_text(rows[1][0])).group()
        date = datetime.strptime(date, '%d/%m/%Y')
        financial_year = str(date.year) + "-" + str(date.year + 1)
        for row in rows[5:-5]:
            data_row = []
            for cell in row:
                text = get_text(cell).strip()
                text = re.sub(r'\([^()]*\)', '', text)
                text = re.sub(r'\n', ' ', text)
                data_row.append(text)
            data_row.append(financial_year)
            data_row.append(str(uuid.uuid4()))
            self.data.append(data_row)

        date = re.search(r'\d+/\d+/\d+', get_text(rows[-2][0]))
        if date:
            date = date.group().strip()
            date = datetime.strptime(date, '%d/%m/%Y')
            data_row = [date.strftime('%b-%Y'), date.strftime('%d-%m-%Y'), 'CR',
                        f'Interest Received for {financial_year}', 0, 0, get_text(rows[-2][-3]), get_text(rows[-2][-2]),
                        get_text(rows[-2][-1]), financial_year, str(uuid.uuid4())]
            self.data.append(data_row)
        return self.data

    def save(self, file_format="json", file_path=None):
        df = DataFrame(self.data, columns=self.header)

        clean_txt(df.epfAmount)
        clean_txt(df.epsAmount)
        clean_txt(df.employeeContribution)
        clean_txt(df.employerContribution)
        clean_txt(df.pensionAmount)

        df.transactionDate = pd.to_datetime(df.transactionDate, dayfirst=True, format="%d-%m-%Y")
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


def cell_in_same_row(c1, c2):
    c1_center = c1[1] + c1[3] - c1[3] / 2
    c2_bottom = c2[1] + c2[3]
    c2_top = c2[1]
    return c2_top < c1_center < c2_bottom


# Sort rows by average height of their center.
def avg_height_of_center(row):
    centers = [y + h - h / 2 for x, y, w, h in row]
    return sum(centers) / len(centers)


def get_mask(image, scale):
    blur_kernel_size = (17, 17)
    std_dev_x_direction = 0
    std_dev_y_direction = 0
    blurred = cv2.GaussianBlur(image, blur_kernel_size, std_dev_x_direction, std_dev_y_direction)
    max_color_val = 255
    block_size = 15
    subtract_from_mean = -2
    img_bin = cv2.adaptiveThreshold(
        ~blurred,
        max_color_val,
        cv2.ADAPTIVE_THRESH_MEAN_C,
        cv2.THRESH_BINARY,
        block_size,
        subtract_from_mean,
    )
    vertical = horizontal = img_bin.copy()
    image_width, image_height = horizontal.shape
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (int(image_width // scale), 1))
    horizontally_opened = cv2.morphologyEx(img_bin, cv2.MORPH_OPEN, horizontal_kernel)
    vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, int(image_height // scale)))
    vertically_opened = cv2.morphologyEx(img_bin, cv2.MORPH_OPEN, vertical_kernel)
    horizontally_dilated = cv2.dilate(horizontally_opened, horizontal_kernel)
    vertically_dilated = cv2.dilate(vertically_opened, vertical_kernel)
    return horizontally_dilated + vertically_dilated


def get_tables(image, scale, min_table_area):
    mask = get_mask(image, scale)
    contours, heirarchy = cv2.findContours(
        mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE,
    )
    contours = [c for c in contours if cv2.contourArea(c) > min_table_area]
    perimeter_lengths = [cv2.arcLength(c, True) for c in contours]
    epsilons = [0.1 * p for p in perimeter_lengths]
    approx_polys = [cv2.approxPolyDP(c, e, True) for c, e in zip(contours, epsilons)]
    bounding_rects = [cv2.boundingRect(a) for a in approx_polys]
    return [image[y:y + h, x:x + w] for x, y, w, h in bounding_rects]


def get_cells(image, scale, min_rect_width, min_rect_height):
    mask = get_mask(image, scale)
    contours, heirarchy = cv2.findContours(
        mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE,
    )
    perimeter_lengths = [cv2.arcLength(c, True) for c in contours]
    epsilons = [0.05 * p for p in perimeter_lengths]
    approx_polys = [cv2.approxPolyDP(c, e, True) for c, e in zip(contours, epsilons)]
    bounding_rects = [cv2.boundingRect(a) for a in approx_polys]
    # Filter out rectangles that are too narrow or too short.
    bounding_rects = [
        r for r in bounding_rects if min_rect_width < r[2] and min_rect_height < r[3]
    ]
    # The largest bounding rectangle is assumed to be the entire table.
    # Remove it from the list. We don't want to accidentally try to OCR
    # the entire table.
    largest_rect = max(bounding_rects, key=lambda r: r[2] * r[3])
    bounding_rects = [b for b in bounding_rects if b is not largest_rect]
    cells = [c for c in bounding_rects]
    rows = []
    while cells:
        first = cells[0]
        rest = cells[1:]
        cells_in_same_row = sorted(
            [
                c for c in rest
                if cell_in_same_row(c, first)
            ],
            key=lambda c: c[0]
        )
        row_cells = sorted([first] + cells_in_same_row, key=lambda c: c[0])
        rows.append(row_cells)
        cells = [
            c for c in rest
            if not cell_in_same_row(c, first)
        ]
    rows.sort(key=avg_height_of_center)
    cell_images_rows = []
    for row in rows:
        cell_images_row = []
        for x, y, w, h in row:
            cell_images_row.append(image[y:y + h, x:x + w])
        cell_images_rows.append(cell_images_row)
    return cell_images_rows


def get_text(cell):
    d = os.path.dirname(sys.modules["table_ocr"].__file__)
    tessdata_dir = os.path.join(d, "tessdata")
    tess_args = ["--psm", "6", "--tessdata-dir", tessdata_dir]
    return pytesseract.image_to_string(
        cell,
        config=" ".join(tess_args)
    )


def get_cv2_image(pillow_image):
    return cv2.cvtColor(np.asarray(pillow_image), cv2.COLOR_RGB2GRAY)


class StockProcessor(FundProcessor):
    def __init__(self, broker_dp_id):
        self.header = ["order_no", "stock_isin", "transaction_type",
                       "stock_quantity", "stock_transaction_price", "amount", "transaction_date"]
        self.data = []
        self.broker_impl_map = {
            '12081600': ZerodhaBrokingStockProcessor(),
            '12088700': NextBillionStockProcessor()
        }
        self.broker_impl = self.broker_impl_map[broker_dp_id]

    def process(self, file_path, password):
        images = convert_from_path(file_path, userpw=password)
        self.data = self.broker_impl.process(images)

    def save(self, file_format="json", file_path=None):
        df = DataFrame(self.data, columns=self.header)
        print(self.data)

        clean_txt(df.stock_quantity)
        clean_txt(df.stock_transaction_price)
        clean_txt(df.amount)

        df.transaction_date = pd.to_datetime(df.transaction_date, dayfirst=True, format="%d-%m-%Y %H:%M:%S")
        df.transaction_date = df.transaction_date.dt.strftime('%d-%b-%Y %H:%M:%S')
        df.stock_quantity = df.stock_quantity.astype('float')
        df.stock_transaction_price = df.stock_transaction_price.astype('float')
        df.amount = df.amount.astype('float')

        if file_format == "json":
            save_to_json(df, file_path)
        else:
            save_to_csv(df, file_path)


class NextBillionStockProcessor:

    def __init__(self):
        self.all_data = []
        self.table_scale = 60

    def get_table_data(self, trade_date, table):
        data_for_same_isin = []
        rows = get_cells(table, 60, 40, 40)
        for i, row in enumerate(rows):
            order_no = get_text(row[0]).strip()
            if len(order_no.strip()) > 0:
                order_no = str(order_no).replace('\n', '')
                if len(order_no) == 16 or len(order_no) == 19:
                    inner_data = {
                        'order_no': order_no.strip(),
                        'transaction_type': get_text(row[6]).strip().upper(),
                        'stock_quantity': get_text(row[7]).strip(),
                        'stock_transaction_price': get_text(row[10]).strip(),
                        'amount': get_text(row[12]).strip(),
                        'transaction_date': trade_date + " " + get_text(row[1]).strip()
                    }
                    data_for_same_isin.append(inner_data)
                else:
                    if len(row) < 14:
                        for stock_data in data_for_same_isin:
                            stock_data['stock_isin'] = get_text(row[1]).strip()
                            self.all_data.append(stock_data)
                        data_for_same_isin = []

    def process(self, images: list[Image]):
        tables = get_tables(get_cv2_image(images[0]), self.table_scale, 1e4)
        rows = get_cells(tables[1], 60, 40, 40)
        trade_date = get_text(rows[1][1]).strip()
        self.get_table_data(trade_date, tables[0])
        for image in images[1:-1]:
            for table in get_tables(get_cv2_image(image), self.table_scale, 1e5):
                self.get_table_data(trade_date, table)
        return self.all_data


class ZerodhaBrokingStockProcessor:

    def __init__(self):
        self.all_data = []
        self.table_scale = 60

    def process(self, images: list[Image]):
        text = get_text(get_cv2_image(images[0]))
        group = re.search(r'trade date: (.*)\n', text.lower()).group()
        trade_date = re.search(r"\d+/\d+/\d+", group.strip()).group()
        trade_date = datetime.strptime(trade_date, '%d/%m/%Y').strftime('%d-%m-%Y')

        for image in images[1:-2]:
            for table in get_tables(get_cv2_image(image), self.table_scale, 1e5):
                data_for_same_isin = []
                rows = get_cells(table, 60, 40 ,20)
                for row in rows:
                    order_no = get_text(row[0]).strip()
                    if len(order_no) == 16 or len(order_no) == 19:
                        isin = get_text(row[4]).strip().split("/")[1]
                        transaction_type = get_text(row[5]).strip().upper()
                        stock_quantity = re.search(r'\d+', get_text(row[7])).group().strip()
                        amount = get_text(row[12]).strip().replace('(', '').replace(')', '')
                        stock_transaction_price = str(float(amount) / int(stock_quantity))
                        if transaction_type == 'S':
                            stock_quantity = '-' + stock_quantity
                        if transaction_type == 'B':
                            amount = '-' + amount
                        trade_time = re.search(r'\d+:\d+:\d+', get_text(row[1])).group().strip()
                        inner_data = {
                            'order_no': order_no.strip(),
                            'stock_isin': isin,
                            'transaction_type': transaction_type,
                            'stock_quantity': stock_quantity,
                            'stock_transaction_price': stock_transaction_price,
                            'amount': amount,
                            'transaction_date': trade_date + " " + trade_time
                        }
                        data_for_same_isin.append(inner_data)
                    else:
                        exchange = re.search(r'([a-zA-Z\s]+)', get_text(row[6])).group().strip()
                        if len(exchange) > 0 and exchange.lower() == 'sub total':
                            for stock_data in data_for_same_isin:
                                self.all_data.append(stock_data)
                            data_for_same_isin = []
        return self.all_data


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
    x.replace("\\(", "-", regex=True, inplace=True)
    x.replace("\\)", " ", regex=True, inplace=True)
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
