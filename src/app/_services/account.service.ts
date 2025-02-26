import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './../_models/user';

// const baseUrl = 'http://alum3.iesfsl.org/api/user';
const baseUrl = 'http://localhost:8080/user';
const registroUrl = 'http://alum3.iesfsl.org/api';

@Injectable({ providedIn: 'root' })

export class AccountService {
  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;
  usuario: any;
  password: any;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  login(usuario, password): Observable<User> {
    const user = { usuario: this.usuario, password: this.password };
    let body = { "nombre": usuario, "password": password }
    return this.http.post<User>(`${baseUrl}` + `/authenticate`, body)
    //     .pipe(map(user => {
    //       // store user details and jwt token in local storage to keep user logged in between page refreshes
    //       localStorage.setItem('user', JSON.stringify(user));
    //       this.userSubject.next(user);
    //       return user;
  };

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  register(user: User) {
    return this.http.post(`${registroUrl}` + `/usuarios`, user);
  }

  getAll() {
    return this.http.get<User[]>(`${baseUrl}`);
  }

  getById(id: string) {
    return this.http.get<User>(`${baseUrl}/${id}`);
  }

  update(id, params) {
    return this.http.put(`${baseUrl}/${id}`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        if (id == this.userValue.id) {
          // update local storage
          const user = { ...this.userValue, ...params };
          localStorage.setItem('user', JSON.stringify(user));

          // publish updated user to subscribers
          this.userSubject.next(user);
        }
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`)
      .pipe(map(x => {
        // auto logout if the logged in user deleted their own record
        if (id == this.userValue.id) {
          this.logout();
        }
        return x;
      }));
  }
}