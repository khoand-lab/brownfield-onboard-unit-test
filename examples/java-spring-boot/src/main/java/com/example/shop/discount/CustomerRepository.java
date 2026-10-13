package com.example.shop.discount;

import java.util.Optional;

public interface CustomerRepository {

    Optional<Customer> findById(String id);
}
