import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';

import { Customer } from './customer';

export const CUSTOMER_API = '/api/customers';

// Gọi API thật qua HttpClient.
@Injectable({ providedIn: 'root' })
export class CustomerRepository {
  private readonly http = inject(HttpClient);

  /** Trả về khách hàng, hoặc null khi API trả 404. */
  findById(id: string): Observable<Customer | null> {
    return this.http
      .get<Customer>(`${CUSTOMER_API}/${encodeURIComponent(id)}`)
      .pipe(catchError((error: HttpErrorResponse) => (error.status === 404 ? of(null) : throwError(() => error))));
  }
}
