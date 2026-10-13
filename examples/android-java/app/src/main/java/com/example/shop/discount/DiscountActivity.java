package com.example.shop.discount;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;

/** Màn hình hiển thị; chỉ lắp ráp, không có logic cần unit test. */
public class DiscountActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TextView view = new TextView(this);
        view.setText("Shop");
        setContentView(view);
    }
}
