package com.example.shop.api;

import com.example.shop.discount.Customer;

import java.io.IOException;

/** Gọi API khách hàng. Trả về null khi không tìm thấy. */
public interface CustomerApi {
    Customer fetchCustomer(String id) throws IOException;
}
