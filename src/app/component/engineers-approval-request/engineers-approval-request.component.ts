import { getLocaleDateFormat } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { stubFalse } from 'lodash';
import * as moment from 'moment';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-engineers-approval-request',
  templateUrl: './engineers-approval-request.component.html',
  styleUrls: ['./engineers-approval-request.component.css'],

})
export class EngineersApprovalRequestComponent implements OnInit{
  engineer_data:any
  profile_image:any
  uploaded_files:any
  licence_files:any
  certificate_files:any
  resume:any
  id:any
  show_education_approve_button:boolean=false
  show_education_reject_button:boolean=false
  

  constructor(
    private route: ActivatedRoute,
    public dataservice:DataService,
    private httpclient: HttpClient,
    private dialogService: DialogService,
  ) {
   
  }

  ngOnInit() {
   this.route.params.subscribe((params:any) => {
     debugger
       this.id=this.route.parent?.snapshot['params']['id']
      this.getdata()
    })
  }


  getdata(){
    this.dataservice.getDataById("engineer",this.id).subscribe((res:any)=>{
      this.engineer_data=res.data
      // if(this.engineer_data.certificateverfication.status=="Approved"){
      //   this.show_education_approve_button=true
      //   this.show_education_reject_button=false
      // }else if(this.engineer_data.certificateverfication.status=="Reject"){
      //   this.show_education_approve_button=false
      //   this.show_education_reject_button=true
      // } else if(this.engineer_data.certificateverfication.status==""){
      //   this.show_education_approve_button=true
      //   this.show_education_reject_button=true
      // }
      console.log(this.engineer_data)
      this.dataservice.getDataById("s3",this.id).subscribe((res:any)=>{
        this.uploaded_files=res.data
        //licence Files
        this.licence_files=this.uploaded_files?.filter((a:any)=>{return a.category=="licence"})

         //Certificate Files
         this.certificate_files=this.uploaded_files?.filter((a:any)=>{return a.category=="certificate"})
         console.log(this.certificate_files)

         //Resume File
         this.resume=this.uploaded_files?.filter((a:any)=>{return a.category=="resume"})

        //Profile Image
        this.profile_image= this.uploaded_files?.find((a:any)=>{return a.category=="profile"})  
      })
     })
  }










 


  updatebyid(data:any,category:any){
    this.dataservice.updateById("engineer", this.engineer_data._id,data).subscribe((res:any)=>{
    if(res['status']==200){
      this.dialogService.openSnackBar(`${category} has been ${data.certificateverfication.status}`, "OK")
      this.getdata()

    }
    })
    }

    finalreject(reason:any){
      let data:any={}
      data['status']="Reject"
      data['backgroundverification.status']="Reject"
      data['backgroundverification.verifieddatetime']=moment().format()
      data['backgroundverification.verifiedby']=""
      data['backgroundverification.reason']=reason || ""
      this.updatebyid(data,"All the Documents")
    }

    // finalapprove(reason:any){
    //   let data:any={}
    //   data['status']="Approved"
    //   data['backgroundverification.status']="Approved"
    //   data['backgroundverification.verifieddatetime']=moment().format()
    //   data['backgroundverification.verifiedby']=""
    //   data['backgroundverification.reason']=reason || ""
    //   this.updatebyid(data,"All the Documents")

    // }

  

    // education_details_approve(){
    //   if( this.engineer_data.certificateverfication.status=="Approved") return 
    //   let data:any={}
    //   data['certificateverfication.status']="Approved"
    //   data['certificateverfication.verifieddatetime']=moment().format()
    //   data['certificateverfication.verifiedby']=""
    //   this.updatebyId(data)
    // }

    education_details_reject(){
      if( this.engineer_data.certificateverfication.status=="Reject") return 
      let data:any={}
      data['certificateverfication.status']="Reject"
      data['certificateverfication.verifieddatetime']=moment().format()
      data['certificateverfication.verifiedby']=""
      this.updatebyId(data)
    }

    // getdatabyId(){
    //   this.dataservice.getDataById("engineer",this.id).subscribe((res:any)=>{
    //     let data=res.data
    //     if(data.certificateverfication.status=="Approved"){
    //       this.show_education_approve_button=true
    //       this.show_education_reject_button=false
    //     } else if(data.certificateverfication.status=="Reject"){
    //       this.show_education_approve_button=false
    //       this.show_education_reject_button=true
    //     }
    //   })
    // }

    updatebyId(data:any){
      this.dataservice.updateById("engineer", this.engineer_data._id,data).subscribe((res:any)=>{
        if(res['status']==200){
          //this.getdatabyId()
          this.dialogService.openSnackBar(`Document has been ${data?.status}`, "OK")
        }
        })
    }
}
