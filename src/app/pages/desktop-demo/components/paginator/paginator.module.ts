import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagginatorComponent } from './paginator.component';

@NgModule({
  declarations: [PagginatorComponent],
  exports: [PagginatorComponent],
  imports: [CommonModule],
})
export class PagginatorModule { }
