package com.example.shop.discount;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.shop.api.CustomerApi;

import java.util.concurrent.Executor;

/**
 * Tải khách hàng và tính tỉ lệ giảm giá. Dependency được tiêm qua constructor.
 * Kết quả của lần tải cũ bị bỏ qua khi load được gọi lại với id khác.
 */
public class DiscountViewModel extends ViewModel {

    public static final class State {
        public final String status; // idle | loading | ready | error
        public final double rate;
        public final String message;

        State(String status, double rate, String message) {
            this.status = status;
            this.rate = rate;
            this.message = message;
        }
    }

    private final CustomerApi api;
    private final DiscountCalculator calculator;
    private final Executor executor;
    private final MutableLiveData<State> state = new MutableLiveData<>(new State("idle", 0, null));
    private volatile String currentId;

    public DiscountViewModel(CustomerApi api, DiscountCalculator calculator, Executor executor) {
        this.api = api;
        this.calculator = calculator;
        this.executor = executor;
    }

    public LiveData<State> getState() {
        return state;
    }

    public void load(final String customerId) {
        currentId = customerId;
        if (customerId == null || customerId.trim().isEmpty()) {
            state.setValue(new State("idle", 0, null));
            return;
        }
        state.setValue(new State("loading", 0, null));
        executor.execute(() -> {
            State result;
            try {
                Customer customer = api.fetchCustomer(customerId);
                result = customer == null
                        ? new State("error", 0, "Không tìm thấy khách hàng")
                        : new State("ready", calculator.rate(customer), null);
            } catch (Exception e) {
                result = new State("error", 0, e.getMessage());
            }
            if (customerId.equals(currentId)) {
                state.postValue(result);
            }
        });
    }
}
