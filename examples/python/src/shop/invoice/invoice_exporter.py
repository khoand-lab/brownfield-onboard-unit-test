import urllib.request
from datetime import datetime
from pathlib import Path

ACCOUNTING_URL = "http://accounting.internal/api/invoices"
INVOICE_DIR = Path("/var/invoices")


def export_invoice(order_id: str, total) -> str:
    """Xuất hóa đơn ra file và gửi lên hệ thống kế toán.

    Phụ thuộc cứng vào thời gian hệ thống, file system và HTTP (không tiêm được): khó unit test.
    """
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    file_name = f"invoice-{order_id}-{timestamp}.txt"
    (INVOICE_DIR / file_name).write_text(f"{order_id};{total}", encoding="utf-8")

    request = urllib.request.Request(ACCOUNTING_URL, data=file_name.encode(), method="POST")
    with urllib.request.urlopen(request, timeout=10) as response:
        if response.status >= 400:
            raise RuntimeError(f"accounting rejected invoice: {response.status}")
    return file_name
