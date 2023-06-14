import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  FirebaseStorage,
  getStorage,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  isDragOver = false;
  isVideoReady = false;
  file: File | null = null;

  alertMessage = '';
  alertColor = 'blue';
  showAlert = false;
  inSubmission = false;

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  uploadForm: FormGroup = new FormGroup({
    title: this.title,
  });

  storage: FirebaseStorage;
  constructor() {
    // Create a root reference
    this.storage = getStorage();
  }
  async submit(values: any) {
    console.log(values);
    console.log(this.uploadForm);
    if (this.uploadForm.invalid) {
      return;
    }
    this.inSubmission = true;
    // Alert
    this.showInProgressAlert('Uploading your video, please wait...');
    // Create a reference to target remote file
    console.log('Starting upload...');
    const fileRef = ref(
      this.storage,
      `/clips/${this.title.value + Date.now()}.mp4`
    );
    uploadBytes(fileRef, this.file!)
      .then((snapshot) => {
        console.log('upload completed!');
        this.showSuccessAlert('Upload complete!');
        this.resetFormValues();
        this.inSubmission = false;
        // reset alert after 3 seconds
        setTimeout(() => {
          this.resetAlert();
        }, 3000);
      })
      .catch((err) => {
        console.log(err.code);
        this.showErrorAlert('Something went wrong during the upload.');
        this.inSubmission = false;
      });
  }
  resetFormValues() {
    this.uploadForm.reset();
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
  async storeFile(event: Event) {
    this.isDragOver = false;
    this.file = (event as DragEvent).dataTransfer?.files.item(0) ?? null;
    console.log(this.file);

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.isVideoReady = true;
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
  }
}
