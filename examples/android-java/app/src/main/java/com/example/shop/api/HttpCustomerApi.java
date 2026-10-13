package com.example.shop.api;

import com.example.shop.discount.Customer;
import com.example.shop.discount.Tier;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/** Triển khai thật bằng HttpURLConnection và org.json (thuộc framework Android). */
public class HttpCustomerApi implements CustomerApi {
    private final String baseUrl;

    public HttpCustomerApi(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    @Override
    public Customer fetchCustomer(String id) throws IOException {
        URL url = new URL(baseUrl + "/customers/" + URLEncoder.encode(id, "UTF-8"));
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        try {
            int status = connection.getResponseCode();
            if (status == 404) {
                return null;
            }
            if (status != 200) {
                throw new IOException("customer api failed: " + status);
            }
            JSONObject json = new JSONObject(read(connection.getInputStream()));
            return new Customer(
                    json.getString("id"),
                    json.getString("name"),
                    Tier.valueOf(json.getString("tier")),
                    json.getInt("ordersLastYear"));
        } catch (JSONException e) {
            throw new IOException("invalid customer json", e);
        } finally {
            connection.disconnect();
        }
    }

    private static String read(InputStream in) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int n;
        while ((n = in.read(buffer)) != -1) {
            out.write(buffer, 0, n);
        }
        return out.toString(StandardCharsets.UTF_8.name());
    }
}
