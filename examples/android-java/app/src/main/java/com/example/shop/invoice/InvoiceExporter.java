package com.example.shop.invoice;

import android.content.Context;
import android.content.SharedPreferences;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Xuất hóa đơn ra file và gửi lên hệ thống kế toán.
 * Phụ thuộc cứng vào thời gian hệ thống, file system của app, SharedPreferences và HTTP
 * (không truyền vào được): khó unit test.
 */
public class InvoiceExporter {
    private static final String ACCOUNTING_URL = "http://accounting.internal/api/invoices";

    private final Context context;

    public InvoiceExporter(Context context) {
        this.context = context;
    }

    public String export(String orderId, double total) throws IOException {
        String timestamp = new SimpleDateFormat("yyyyMMddHHmmss", Locale.ROOT).format(new Date());
        String fileName = "invoice-" + orderId + "-" + timestamp + ".txt";

        File file = new File(context.getFilesDir(), fileName);
        try (FileOutputStream out = new FileOutputStream(file)) {
            out.write((orderId + ";" + total).getBytes(StandardCharsets.UTF_8));
        }

        HttpURLConnection connection = (HttpURLConnection) new URL(ACCOUNTING_URL).openConnection();
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.getOutputStream().write(fileName.getBytes(StandardCharsets.UTF_8));
        int status = connection.getResponseCode();
        connection.disconnect();
        if (status != 200) {
            throw new IOException("accounting rejected invoice: " + status);
        }

        SharedPreferences prefs = context.getSharedPreferences("invoices", Context.MODE_PRIVATE);
        prefs.edit().putString("lastInvoice", fileName).apply();
        return fileName;
    }
}
