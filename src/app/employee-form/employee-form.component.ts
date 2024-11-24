import { Component, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../service/employee.service';
import { v4 as uuidv4 } from 'uuid';
import { MatDatepicker } from '@angular/material/datepicker';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss'],
})
export class EmployeeFormComponent {

  employeeform: FormGroup;
  isEdit = signal(false);
  tenureTodate: Date | string = "No Date";
  tenureFromdate: Date | string = new Date();
  tenureFrom = new FormControl(this.tenureFromdate, Validators.required);
  roles = signal(["Full stack Developer", "MEAN stack Developer", "Python Developer", "Angular Developer", "Product Designer", "QA Tester", "Product Owner", "Scrum master"]);
  selectedToIndex = signal(0);
  selectedFromIndex = signal(0);
  fromPickerButtons = [
    { label: 'Today', action: () => this.selectToday() },
    { label: 'Next Monday', action: () => this.selectNextMonday() },
    { label: 'Next Tuesday', action: () => this.selectNextTuesday() },
    { label: 'After 1 week', action: () => this.selectOneWeekLater() },
  ];

  toPickerButtons = [
    { label: 'No Date', action: () => this.NoDate() },
    { label: 'Today', action: () => this.selectTodayTo() }
  ];

  @ViewChild('pickerFrom') pickerFrom!: MatDatepicker<Date>;
  @ViewChild('pickerTo') pickerTo!: MatDatepicker<Date>;
  showWarning = signal(false);
  constructor(private fb: FormBuilder, private employeeService: EmployeeService,
    private router: Router
  ) {
    this.employeeform = this.fb.group({
      id: null,
      name: new FormControl("", Validators.required),
      tenureFrom: this.tenureFrom,
      tenureTo: null,
      role: new FormControl("", Validators.required),
    });

    this.isEdit.set(this.employeeService.isEditEmployee);
    if (this.isEdit()) {
      this.employeeform.patchValue(this.employeeService.editEmployeeDetails);
      this.tenureTodate = this.employeeService.editEmployeeDetails.tenureTo
    }

  }

  public async submit() {
    this.employeeform.value.tenureTo = this.tenureTodate === "No Date" ? "" : this.tenureTodate;
    if((this.employeeform.value.tenureTo && this.employeeform.value.tenureTo > this.employeeform.value.tenureFrom) || this.employeeform.value.tenureTo === ""){
      if (this.isEdit()) {
        await this.employeeService.updateEmployee(this.employeeform.value);
      } else {
        this.employeeform.value.id = uuidv4()
        await this.employeeService.addEmployee(this.employeeform.value);
      }
      this.resetForm();
      this.router.navigate(['/'])
    }else{
      this.showWarning.set(true);
      return;
    }
  }

  public resetForm() {
    this.employeeform.reset();
    this.employeeService.isEditEmployee = false;
    this.employeeService.editEmployeeDetails = {
      id: '',
      name: '',
      tenureFrom: '',
      tenureTo: '',
      role: ''
    }
    this.isEdit.set(false);
  }


  public onDatepickerOpened(form?: any): void {

    this.getTheSelectedDateInfo(form);

  }

  private getTheSelectedDateInfo(form?: any) {
    const matDatePickerElement: any = document.getElementsByTagName("mat-month-view");
    setTimeout(() => {
      if (matDatePickerElement && matDatePickerElement.length > 0) {
        const children = matDatePickerElement[0].getElementsByClassName('mat-calendar-table');
        if (form) {
          children[0].addEventListener('click', (event: any) => {
            const children = matDatePickerElement[0].getElementsByClassName('mat-calendar-body-active');
            form.value = children[0].getAttribute('aria-label');
          });
        } else {
          children[0].addEventListener('click', (event: any) => {
            const children = matDatePickerElement[0].getElementsByClassName('mat-calendar-body-active');
            this.tenureTodate = children[0].getAttribute('aria-label');
          });
        }

      }

    }, 100);
  }

  public selectToday() {
    const date = new Date();
    this.refreshFromDatePicker(date);
  }

  public selectNextMonday() {
    const date = new Date();
    const day = date.getDay();
    const nextMonday = day === 1 ? 7 : ((8 - day) % 7);
    date.setDate(date.getDate() + nextMonday);
    this.refreshFromDatePicker(date);

  }

  public selectNextTuesday() {
    const date = new Date();
    const day = date.getDay();
    const nextTuesday = day === 2 ? 7 : ((9 - day) % 7);
    date.setDate(date.getDate() + nextTuesday);
    this.refreshFromDatePicker(date);


  }

  public selectOneWeekLater() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    this.refreshFromDatePicker(date);

  }
  private refreshFromDatePicker(date: any): void {
    if (this.tenureTodate && this.tenureTodate < date) {
      this.tenureTodate = ""
    }
    this.tenureFrom.patchValue(date);
    this.pickerFrom.close();
  }

  public selectTodayTo() {
    const date = new Date();
    this.tenureTodate = date;
    this.pickerTo.close();
  }

  public NoDate() {
    this.tenureTodate = "No Date";
    this.pickerTo.close();
  }
  public routeToEmployeeList() {
    this.resetForm();
    this.router.navigate(['/'])
  }

  public closeWarning(){
    this.showWarning.set(false);
  }
}
