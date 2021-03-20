export interface Treatment {
  treatmentId?: number;
  userId: string;
  treatmentCost: number;
  createdAt?: Date;
  treatmentImageUrl?: string;
  treatmentImageName?: string;

  treatmentName?: string;
  patientId?: number;
  treatmentTypeId?: number;
}
