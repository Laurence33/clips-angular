import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  FirebaseStorage,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
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
  uploadProgress = 0;

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
    this.showInProgressAlert('Uploading your clip, please wait...');
    // Create a reference to target remote file
    console.log('Starting upload...');
    const fileRef = ref(
      this.storage,
      `/clips/${this.title.value + Date.now()}.mp4`
    );
    const uploadTask = uploadBytesResumable(fileRef, this.file!);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        this.uploadProgress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      },
      (err) => {
        console.log(err.code);
        this.showErrorAlert('Something went wrong, please try again later.');
        this.inSubmission = false;
      },
      () => {
        console.log('upload completed!');
        this.showSuccessAlert(
          'Upload success! You video is now ready to be shared to the world.'
        );
        this.resetFormValues();
        this.inSubmission = false;

        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
        });

        // reset alert after 3 seconds
        setTimeout(() => {
          this.resetAlert();
        }, 3000);
      }
    );
  }
  resetFormValues() {
    this.uploadForm.reset();
    this.isVideoReady = false;
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
