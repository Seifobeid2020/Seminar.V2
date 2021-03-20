import { Subscription } from 'rxjs';
import { PatientService } from './../patient.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Patient } from '../../shared/models/patient.model';
import { Treatment } from '../../shared/models/treatment.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TreatmentType } from '../../shared/models/treatment-type.model';

import { FileUpload } from './shared/FileUpload';
import { FileUploadService } from './shared/file-upload.service';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css'],
})
export class PatientDetailsComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private uploadService: FileUploadService
  ) {}

  fileName = '';

  sub: Subscription;

  id: number;

  patientDetails: Patient;

  treatments: Treatment[];

  treatment: Treatment;

  selectedTreatments: Treatment[];

  treatmentTypes: TreatmentType[];

  selectedTreatmentType: TreatmentType;

  treatmentDialog: boolean;

  submitted: boolean;

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id;
    this.patientService.getPatient(this.id).then((data) => {
      this.patientDetails = data;
    });

    this.patientService.getTreatmentTypes().then((response) => {
      this.treatmentTypes = response;

      this.selectedTreatmentType = this.treatmentTypes[0];
      console.log(this.selectedTreatmentType);
    });

    this.patientService
      .getTreatments(this.id)
      .then((data) => {
        console.log('these are all the treatment: ', data);
        this.treatments = data;
      })
      .catch((err) => console.log(err));

    this.sub = this.patientService.treatmentsChanged.subscribe((response) => {
      this.treatments.push(response);
    });
  }

  openNew() {
    this.treatment = { userId: 'maen', treatmentCost: 0 };
    this.submitted = false;
    this.treatmentDialog = true;
  }
  deleteTreatment(treatment: Treatment) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this Treatment?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.treatments = this.treatments.filter(
          (val) => val.treatmentId !== treatment.treatmentId
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Treatment Deleted',
          life: 1500,
        });
      },
    });

    // Delete From API
  }

  deleteSelectedPatients() {}

  hideDialog() {
    this.treatmentDialog = false;
    this.submitted = false;
  }
  async saveTreatment() {
    this.submitted = true;
    // if (this.patient.firstName && this.patient.firstName.trim()) {
    // if edite
    if (this.treatment.treatmentId) {
      // this.patient.gender = this.selectedgenderValue == 'Male' ? 1 : 0;
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
    await this.upload().then((fileUpload) => {
      let newTreatment: Treatment = {
        userId: 'maen',
        patientId: this.id,
        treatmentImageUrl: fileUpload.url,
        treatmentImageName: fileUpload.name,
        treatmentCost: this.selectedTreatmentType.defaultCost,
        treatmentTypeId: this.selectedTreatmentType.treatmentTypeId,
      };
      console.log('this is alll: ' + newTreatment);
      this.patientService.craeteTreatment(newTreatment);
    });

    this.treatmentDialog = false;
    // } end of first if
  }
  //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%Upload Image %%%%%%%%%%%%%%%%%%%%%%%%%%%
  selectedFiles?: FileList;
  currentFileUpload?: FileUpload;
  percentage = 0;

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
    this.fileName = this.selectedFiles.item(0).name;
  }
  async upload() {
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);
      this.selectedFiles = undefined;
      if (file) {
        this.currentFileUpload = new FileUpload(file);
        this.currentFileUpload.id = this.id;
        return await this.uploadService.pushFileToStorage(
          this.currentFileUpload
        );

        // .subscribe(
        //   (percentage) => {
        //     this.percentage = Math.round(percentage ? percentage : 0);
        //   },
        //   (error) => {
        //     console.log(error);
        //   }
        // );
      }
    }
  }
  //delete image
  deleteFileUpload(fileUpload: FileUpload): void {
    this.uploadService.deleteFile(fileUpload);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
