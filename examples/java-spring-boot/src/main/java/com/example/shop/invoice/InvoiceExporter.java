package com.example.shop.invoice;

import java.io.FileWriter;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Xuất hóa đơn ra file và gửi lên hệ thống kế toán.
 * Phụ thuộc cứng vào thời gian hệ thống, file system và HTTP (không tiêm được): khó unit test.
 */
public class InvoiceExporter {

    private static final String ACCOUNTING_URL = "http://accounting.internal/api/invoices";

    public String export(String orderId, BigDecimal total) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String fileName = "invoice-" + orderId + "-" + timestamp + ".txt";
        try (FileWriter writer = new FileWriter("/var/invoices/" + fileName)) {
            writer.write(orderId + ";" + total);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        try {
            HttpClient.newHttpClient().send(
                    HttpRequest.newBuilder(URI.create(ACCOUNTING_URL))
                            .POST(HttpRequest.BodyPublishers.ofString(fileName))
                            .build(),
                    HttpResponse.BodyHandlers.discarding());
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
        return fileName;
    }
}
