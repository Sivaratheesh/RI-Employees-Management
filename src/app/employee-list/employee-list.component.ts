import { Component, signal, WritableSignal } from '@angular/core';
import { EmployeeService } from '../service/employee.service';
import { IEmployee } from '../interface/employee';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent {

  public currentEmployees: WritableSignal<IEmployee[]> = signal([]);
  public previousEmployees: WritableSignal<IEmployee[]> = signal([]);


  public isDialogVisible = signal(false);

  public selectedIdToDelete = signal("")

  constructor(private employeeService: EmployeeService, private router: Router) { }

  async ngOnInit() {
    this.segregateEmployees()
  }

  deleteEmployee(id: string) {
    this.isDialogVisible.set(true);
    this.selectedIdToDelete.set(id);
  }

  async confirmDelete() {
    await this.employeeService.deleteEmployee(this.selectedIdToDelete());
    this.segregateEmployees()
    this.isDialogVisible.set(false);
    this.selectedIdToDelete.set("");
  }


  editEmployee(employee: IEmployee) {
    this.employeeService.editEmployeeDetails = employee;
    this.employeeService.isEditEmployee = true;
    this.router.navigate(['/add'])
  }
  trackByEmployeeID(index: number, employee: any){
    return employee.id;
  }

  async segregateEmployees(){
    const allEmployess = await this.employeeService.getEmployees();
    let previousEmployees = [];
    let currentEmployees = [];
    for(const employee of allEmployess){
      if(employee.tenureTo && new Date(employee.tenureTo) < new Date()){
        previousEmployees.push(employee);
      }else{
        currentEmployees.push(employee);
      }
    }
    this.currentEmployees.set(currentEmployees);
    this.previousEmployees.set(previousEmployees);
  }
}

