import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { IEmployee } from '../interface/employee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private dbPromise: Promise<IDBPDatabase>;

  public editEmployeeDetails:IEmployee = {
    id: '',
    name: '',
    tenureFrom: '',
    tenureTo: '',
    role: ''
  };

  public isEditEmployee: boolean = false;

  constructor() {
    this.dbPromise = openDB('EmployeeDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('employees')) {
          db.createObjectStore('employees', { keyPath: 'id' });
        }
      },
    });
  }

  async addEmployee(employee: IEmployee) {
    const db = await this.dbPromise;
    return db.add('employees', employee);
  }

  async getEmployees(): Promise<IEmployee[]> {
    const db = await this.dbPromise;
    return db.getAll('employees');
  }

  async updateEmployee(employee: IEmployee) {
    const db = await this.dbPromise
    return db.put('employees', employee);
  }

  async deleteEmployee(id: string) {
    const db = await this.dbPromise;
    return db.delete('employees', id);
  }
}
