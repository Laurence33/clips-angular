import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  FirebaseStorage,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  UploadTask,
} from '@angular/fire/storage';
import { Timestamp } from '@angular/fire/firestore';
import { User, getAuth } from '@angular/fire/auth';
import { IClip } from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnDestroy {
  isDragOver = false;
  isVideoReady = false;
  file: File | null = null;

  alertMessage = '';
  alertColor = 'blue';
  showAlert = false;
  inSubmission = false;
  uploadProgress = 0;
  uploadTask: UploadTask | null = null;
  screenshots: string[] = [];

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  uploadForm: FormGroup = new FormGroup({
    title: this.title,
  });

  storage: FirebaseStorage;

  user: User;
  constructor(
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    // Create a root reference
    this.storage = getStorage();
    const auth = getAuth();
    this.user = auth.currentUser!;
    console.log(this.user);
    this.ffmpegService.init();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.uploadTask?.cancel();
  }
  async submit(values: any) {
    console.log(values);
    console.log(this.uploadForm);
    if (this.uploadForm.invalid) {
      return;
    }
    this.inSubmission = true;
    this.uploadForm.disable();
    // Alert
    this.showInProgressAlert('Uploading your clip, please wait...');
    // Create a reference to target remote file
    console.log('Starting upload...');
    const clipFilename = this.title.value + Date.now();
    const fileRef = ref(this.storage, `/clips/${clipFilename}.mp4`);
    this.uploadTask = uploadBytesResumable(fileRef, this.file!);
    this.uploadTask.on(
      'state_changed',
      (snapshot) => {
        this.uploadProgress = snapshot.bytesTransferred / snapshot.totalBytes;
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
        console.log(err);
        this.showErrorAlert('Something went wrong, please try again later.');
        this.inSubmission = false;
        this.uploadForm.enable();
      },
      async () => {
        console.log('complete');
        const downloadURL = await getDownloadURL(this.uploadTask!.snapshot.ref);
        const clip: IClip = {
          uid: this.user.uid,
          displayName: this.user.displayName!,
          title: this.title.value,
          filename: `${clipFilename}.mp4`,
          fileURL: downloadURL,
          timestamp: Timestamp.now(),
        };
        // Store to Firestore
        const newClip = await this.clipService.createClip(clip);
        console.log(newClip);

        this.resetAlert();
        this.showSuccessAlert(
          'Upload success! You video is now ready to be shared to the world.'
        );
        this.resetFormValues();
        this.inSubmission = false;
        this.uploadForm.enable();
        // reset alert after 3 seconds
        setTimeout(() => {
          this.resetAlert();
          this.router.navigate(['clip', newClip.id]);
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
    if (this.ffmpegService.isRunning) {
      return;
    }
    this.isDragOver = false;
    this.file = (event as DragEvent).dataTransfer?.files.item(0)
      ? (event as DragEvent).dataTransfer?.files.item(0) ?? null
      : (event.target as HTMLInputElement).files?.item(0) ?? null;
    console.log(this.file);

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);

    this.isVideoReady = true;
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
  }
}
