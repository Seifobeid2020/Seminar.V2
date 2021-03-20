import { Component, OnDestroy, OnInit } from '@angular/core';

import { Patient } from '../../shared/models/patient.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PatientService } from '../patient.service';
import { Subscription } from 'rxjs';
import { TreatmentType } from '../../shared/models/treatment-type.model';
import { Treatment } from '../../shared/models/treatment.model';

@Component({
  selector: 'app-patient-table',
  templateUrl: './patient-table.component.html',
  styles: [
    `
      :host ::ng-deep .p-dialog .product-image {
        width: 150px;
        margin: 0 auto 2rem auto;
        display: block;
      }
    `,
  ],
  styleUrls: ['./patient-table.component.css'],
})
export class PatientTableComponent implements OnInit, OnDestroy {
  patientDialog: boolean;

  sub: Subscription;

  patients: Patient[];

  patient: Patient;

  treatmentTypes: TreatmentType[];

  selectedPatients: Patient[];

  selectedTreatmentType: TreatmentType;

  stateGenderOptions: { label: string; value: string }[];

  submitted: boolean;

  selectedgenderValue: string = 'Male';

  newPatientId: number;

  constructor(
    private patientService: PatientService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    //Gender Options
    this.stateGenderOptions = [
      { label: 'Male', value: 'Male' },
      { label: 'Female', value: 'Female' },
    ];
  }

  ngOnInit() {
    this.patientService.getTreatmentTypes().then((response) => {
      this.treatmentTypes = response;
      this.selectedTreatmentType = this.treatmentTypes[0];
    });

    this.patientService.getPatients().then((response) => {
      this.patients = response;
    });

    this.sub = this.patientService.patientsChanged.subscribe((response) => {
      this.patients = [...this.patients, response];
      this.newPatientId = response.patientId;

      let t: Treatment = {
        patientId: this.newPatientId,
        userId: 'maen',
        treatmentCost: this.selectedTreatmentType.defaultCost,
        treatmentTypeId: this.selectedTreatmentType.treatmentTypeId,
      };

      this.patientService.craeteTreatment(t);
    });
  }

  openNew() {
    this.patient = {
      userId: 'maen',
      firstName: '',
      lastName: '',
      age: null,
      gender: this.selectedgenderValue == 'Male' ? 1 : 0,
      phoneNumber: '',
    };
    this.submitted = false;
    this.patientDialog = true;
  }

  deleteSelectedPatients() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected Patients?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.patients = this.patients.filter(
          (val) => !this.selectedPatients.includes(val)
        );
        this.selectedPatients = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Patients Deleted',
          life: 1500,
        });
      },
    });

    // Delete From API
  }

  editPatient(patient: Patient) {
    this.patient = { ...patient };
    this.patientDialog = true;
  }

  deletePatient(patient: Patient) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + patient.firstName + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.patients = this.patients.filter(
          (val) => val.patientId !== patient.patientId
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Patient Deleted',
          life: 1500,
        });
      },
    });

    // Delete From API
  }

  hideDialog() {
    this.patientDialog = false;
    this.submitted = false;
  }

  savePatient() {
    this.submitted = true;
    if (this.patient.firstName && this.patient.firstName.trim()) {
      // if edite
      if (this.patient.patientId) {
        this.patient.gender = this.selectedgenderValue == 'Male' ? 1 : 0;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Patient Updated',
          life: 1500,
        });
      }
      // if add
      else {
        //this.patients.push(this.patient);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Patient Created',
          life: 1500,
        });
      }

      let p: Patient = {
        userId: 'maen',
        firstName: this.patient.firstName,
        lastName: this.patient.lastName,
        age: this.patient.age,
        gender: this.selectedgenderValue == 'Male' ? 1 : 0,
        phoneNumber: this.patient.phoneNumber,
      };

      this.patientService.createPatient(p);
      this.patientDialog = false;
    }
  }

  exportExcel() {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.patients);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'products');
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    import('file-saver').then((FileSaver) => {
      let EXCEL_TYPE =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE,
      });
      FileSaver.saveAs(
        data,
        fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
      );
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
