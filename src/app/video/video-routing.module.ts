import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageComponent } from './manage/manage.component';
import { UploadComponent } from './upload/upload.component';
import {
  canActivate,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';

const redirectUnauthorizedToHome = () => redirectUnauthorizedTo(['/']);
const redirectLoggedInToManage = () => redirectLoggedInTo(['manage']);
const canA = canActivate(redirectUnauthorizedToHome);

const routes: Routes = [
  {
    path: 'manage',
    component: ManageComponent,
    canActivate: [...canA.canActivate],
    data: {
      authOnly: true,
      ...canA.data,
    },
  },
  {
    path: 'upload',
    component: UploadComponent,
    data: {
      authOnly: true,
    },
  },
  {
    path: 'manage-clips',
    redirectTo: 'manage',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VideoRoutingModule {}
