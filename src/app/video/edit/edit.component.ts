import { IClip } from 'src/app/models/clip.model';
import { ModalService } from './../../services/modal.service';
import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() clip: IClip | null = null;

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  clipId = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  formGroup: FormGroup = new FormGroup({
    id: this.clipId,
    title: this.title,
  });

  alertMessage = '';
  alertColor = 'blue';
  showAlert = false;
  inSubmission = false;

  constructor(
    public modalService: ModalService,
    private clipService: ClipService
  ) {}

  async submit() {
    if (!this.clip) return;

    this.resetAlert();
    this.inSubmission = true;
    this.showInProgressAlert('Please wait! Updating  clip...');
    try {
      await this.clipService.updateClip(this.clipId.value, this.title.value);
      this.showSuccessAlert('Successfully updated clip!');
      setTimeout(() => {
        this.resetAlert();
      }, 1500);
    } catch (e) {
      this.showErrorAlert('Something went wrong. Please try again.');
    }
    this.inSubmission = false;
  }
  showErrorAlert(message: string) {
    this.showAlert = true;
    this.alertMessage = message;
    this.alertColor = 'red';
  }
  showSuccessAlert(message: string) {
    this.showAlert = true;
    this.alertMessage = message;
    this.alertColor = 'green';
  }
  showInProgressAlert(message: string) {
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMessage = message;
  }
  resetAlert() {
    this.alertColor = 'blue';
    this.alertMessage = '';
    this.showAlert = false;
  }
  ngOnInit(): void {
    this.modalService.register('editClip');
  }
  ngOnChanges() {
    if (!this.clip) {
      return;
    }
    this.clipId.setValue(this.clip.id!);
    this.title.setValue(this.clip.title);
  }
  ngOnDestroy(): void {
    this.modalService.unregister('editClip');
  }
}
