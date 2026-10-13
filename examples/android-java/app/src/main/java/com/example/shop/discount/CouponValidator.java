package com.example.shop.discount;

import android.text.TextUtils;

import java.util.Locale;
import java.util.regex.Pattern;

/** Kiểm tra mã giảm giá định dạng AAAA-9999 (không phân biệt hoa thường, bỏ khoảng trắng). */
public class CouponValidator {
    private static final Pattern CODE = Pattern.compile("^[A-Z]{4}-\\d{4}$");

    public String normalize(String raw) {
        if (TextUtils.isEmpty(raw)) {
            return "";
        }
        return raw.trim().toUpperCase(Locale.ROOT);
    }

    public boolean isValid(String raw) {
        return CODE.matcher(normalize(raw)).matches();
    }
}
