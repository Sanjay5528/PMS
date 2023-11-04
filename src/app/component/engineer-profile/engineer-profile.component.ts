import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-engineer-profile',
  templateUrl: './engineer-profile.component.html',
  styleUrls: ['./engineer-profile.component.css']
})
export class EngineerProfileComponent implements OnInit{
  id:any
  engineer_data:any
  profile_image:any
  constructor(
    private route: ActivatedRoute,
    private router:Router,
    private dataservice:DataService
  ){

  }
  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      debugger
        this.id=params.id
        this.dataservice.getDataById("engineer",this.id).subscribe((res:any)=>{
          this.engineer_data=res.data

          this.dataservice.getDataById("s3",this.id).subscribe((res:any)=>{
          let data=res.data
          this.profile_image=data.find((a:any)=>{return a.category == "profile"})
          })
         })
      })
  }


  profileroute(){
    this.router.navigate(["data/engineer/"+`${this.id}`+"/profile"])
  }
engineer_list(data:any){
  this.router.navigate([data]);
}
  
}
