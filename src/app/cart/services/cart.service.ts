import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CartItemModel } from 'src/app/shared/models/cartItem.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Костиль на костилі, але працює, хоч і криво. 
  // Основна проблема була з removeProduct, чомусь якщо робити світч 
  // щоб кинути запит для отримання оновленого кошика delete повертав 404,
  // але загалом погано що не неможливо нормально вибрати що саме поверне запит.
  url = 'http://localhost:3000/cart'
  

  totalSum = 0;
  totalQuantity = 0;

  constructor(private http: HttpClient) { }

  getProducts$(): Observable<CartItemModel[]> {
    return this.http.get<CartItemModel[]>(this.url);
  }

  addProduct$(newItem: CartItemModel):  Observable<any>{
        return this.increaseQuantity$(newItem).pipe(
          catchError(() => {
            return this.http.post(this.url, newItem);
          })
        )
  }

  increaseQuantity$(item: CartItemModel): Observable<any> {
    return this.http.patch(`${this.url}/${item.id}`,{...item, quantity:  item.quantity +=1 })
  }

  decreaseQuantity$(item: CartItemModel): Observable<any> {
    return this.http.get(`${this.url}/${item.id}`).pipe(
      switchMap((item: CartItemModel) => {
        if(item.quantity > 1){
          return this.http.patch(`${this.url}/${item.id}`,{...item, quantity:  item.quantity -=1 });
        } else {
          return this.removeProduct(item.id);
        }
      })
    )
  }

  removeProduct(itemId: number): Observable<any>{
    return this.http.delete(`${this.url}/${itemId}`);
  }

  removeAllProducts(): Observable<CartItemModel[]> {
    // Не працює
    return this.http.patch<CartItemModel[]>(this.url, []);
  }

  isEmptyCart(): Observable<boolean> {
      return this.getProducts$().pipe(
        map((cart: CartItemModel[]) => !!cart.length)
      )
  }

  getTotalPrice(): Observable<number> {
      return this.getProducts$().pipe(
        map(
          (cartItems: CartItemModel[]) => cartItems.map(item => item.price * item.quantity).reduce((prev, next) => prev + next, 0)
        )
      )
  }

  getNumberOfItems(): Observable<number> {
    return this.http.get(this.url).pipe(
      map((cartItems: CartItemModel[]) => cartItems.reduce((total , item) => total + item.quantity, 0))
    )
  }
}
