    import { Component } from '@angular/core';
    import { ICellRendererAngularComp } from 'ag-grid-angular';
    import * as moment from 'moment';

    @Component({
      selector: 'app-icon',
      template: `
        <p *ngIf="isWithin5Minutes()">
          <mat-icon>cloud_queue</mat-icon>
        </p>
        <p *ngIf="!isWithin5Minutes()">
          <mat-icon>cloud_off</mat-icon>
        </p>
      `
    })

    export class Icon implements ICellRendererAngularComp {
      params: any;
      timeDifferenceInMinutes: any;

      agInit(params: any): void {
        if(params.data.last_ping!==undefined){

          this.params = params;
          const targetDate = moment(params.data.last_ping)
          const currentDate = moment()
          console.log(params);
          console.log(targetDate)
          console.log(params.data.last_ping);
          
          this.timeDifferenceInMinutes = currentDate.diff(targetDate, 'minutes');
        }else{
          this.timeDifferenceInMinutes = -10;

        }
     }
      //  getCurrentUtcTime(): string {
      //   // const currentUtcTime = moment().utc().format('yyyy-MM-DDT00:00:00.000Z');

      //! moment().utc().format('YYYY-MM-DDTHH:mm:ss.000Z'); // utc format
      //   return currentUtcTime;
      // }
      
      refresh(param: any): boolean {
        return true;
      }

      isWithin5Minutes(): boolean {
        return this.timeDifferenceInMinutes >= -5 && this.timeDifferenceInMinutes <= 5;
      }
    }
