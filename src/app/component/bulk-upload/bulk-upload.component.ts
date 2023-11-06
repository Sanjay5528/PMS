import { Component, OnInit } from '@angular/core';
import { GridReadyEvent, FirstDataRenderedEvent, ColDef,ColumnResizedEvent, Environment,} from 'ag-grid-community';
import { DataService } from 'src/app/services/data.service';
import * as XLSX from "xlsx";
import 'ag-grid-enterprise';
import { DialogService } from 'src/app/services/dialog.service';
import * as moment from "moment";
import { dateCellColorComponent } from './datecolor';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css']
})
export class BulkUploadComponent implements OnInit{
  id:any
  gridApi: any;
  listData:any;
  jobdata:any
  columnDefs:any
  showgrid:boolean=false
  header:any
  data:any[]=[]
  uploadSuccess: any;
  upload_data: any[] = [];
  wopts: XLSX.WritingOptions = { bookType: "xlsx", type: "array" };
  fileName: string = "SheetJS.xlsx";
  components: any;
  template_data:any
  count:any=[]
  upload_button_disabled:boolean =true
  create_job_button_disabled:boolean=true
  percentDone!: number;
  array_data=[]
  showprogress:any
  total_count:any
  public eventSource!: EventSource;

  public baseurl=environment.apiBaseUrl
  private _zone: any;
  constructor(
    private dataService: DataService,
    private dialogservice:DialogService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.components = {
      datecolor: dateCellColorComponent,
    };
  }
  public defaultColDef: ColDef = {
    resizable: true,
    minWidth: 200,
    width:800
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();  
  }
 
  onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.sizeColumnsToFit();
  }
  
  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
    this.id=  params.id
    this.dataService.getDataById("template",this.id).subscribe((res:any)=>{
      this.template_data=res.data['data']
    })
    
      
    })
    this.upload_button_disabled=true
    this.create_job_button_disabled=true
    this.showprogress=false
  }

  

  onFileChange(evt: any) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>evt.target;
    if (target.files.length !== 1) throw new Error("Cannot use multiple files");
    const reader: FileReader = new FileReader();
    let workBook: any = null;
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, {
        type: "binary",
        cellDates: true,
      });
      const wsname: string = wb.SheetNames[0];

   
      workBook = XLSX.read(reader.result, { type: "binary" });
      const sheet = workBook.Sheets[workBook.SheetNames[0]];

      //Validate the mandatory fields
      const rows = XLSX.utils.sheet_to_csv(sheet).split("\n");
      
      
      
      this.header = rows[0].split(",");
      for (let r = 0; r < rows.length; r++) {
        const cols = [];
        var colData:any=rows[r].replace(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/g, ';');
        colData= colData.split(";");
        for (let c = 0; c < colData.length; c++) {
          colData[c]= colData[c].replace(/"/g, '');
          cols.push({ data: colData[c],field:this.header[c],isValid: true });
        }
        this.data.push(cols);
        console.log(rows)
      }


      //to save the data in db
      for (let r = 1; r < rows.length; r++) {
        const cols = [];
        const colData = rows[r].split(",");
        for (let c = 0; c < colData.length; c++) {
          cols.push({
            data: colData[c],
            isValid: true,
          });
        }
        this.upload_data.push(cols);
      }
    };

    reader.readAsBinaryString(target.files[0]);
    this.getdata()
    
  }
 
  getdata(){  
    this.dataService.getDataByFilter("template_config",{}).subscribe((res:any)=>{
        let data= res.data[0].response
        this.columnDefs=data
        this.showgrid=true
        this.validation()
        this.errorcount()

    })
  }


  validation(){
  
    //validate the empty data for string and date
    if(this.columnDefs!=undefined){
      this.columnDefs=this.columnDefs.filter((res:any)=>{return res.mandatorycolumn == true})
     for(let i=0;i<this.columnDefs.length;i++){
      for(let j=1;j<this.data.length;j++){
        // find index position 
      const index = this.header.findIndex((x:any) => { return x==this.columnDefs[i].field})
         if(this.columnDefs[i].field==this.data[j][index].field){
            this.data[j][index].isValid = this.data[j][index].data != "";
             if (this.data[j][index].isValid == false) {
                this.data[j][index].data = this.data[j][index].data = "Missing";
               }
            }
      }
     }



       //date validation
    for(let i=0;i<this.columnDefs.length;i++){
      if(this.columnDefs[i].datatype=="date"){
        for(let j=1;j<this.data.length;j++){
          // find index position 
        const index = this.header.findIndex((x:any) => { return x==this.columnDefs[i].field})
           if(this.columnDefs[i].field==this.data[j][index].field){
        

            let date:any =moment(this.data[j][index].data, "DD-MM-YYYY").toDate();
            date=moment(date).format("MM-DD-yyyy")
            let date_valid=moment(date).isValid()
            
               if (date_valid == false) {
                  this.data[j][index].isValid = false
                  this.data[j][index].datevalid=false
                 } else  if(date_valid == true) {
                  
                   let existing_date=moment(date).format('YYYY-MM-DD')
                   let current_date= moment().format('YYYY-MM-DD')
                  if(existing_date <= current_date){
                    this.data[j][index].isValid = false
                    this.data[j][index].datevalid=false
                  }
                 }
              }
        }
      }
     
     }
    }


    let excel_data: any[] = [];
    let header = { ...this.header };
    for (let r = 1; r < this.data.length; r++) {
      let a = this.data[r];
      var dummy: any = {};
      for (var c = 0; c < a.length; c++) {
        dummy[header[c]] = a[c].data;

      }
      excel_data.push(dummy);
     
    }
    this.listData=excel_data
    this.errorcount()


    //given the  cell color based on the value
    for (let i = 1; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].length; j++) {
        if (this.data[i][j].isValid == false) {
          
          //find the index of column
          const index = this.columnDefs.findIndex((x:any) => x.field === this.data[i][j].field);
          this.columnDefs[index]["cellStyle"] = (param: any) =>
          this.cellcolor(param)
        }  
        //given the cell color for date is invalid or exceeds the below the current date
        if (this.data[i][j].datevalid == false && this.data[i][j].isValid == false) {
          
          console.log(this.data,"this.data")
          //find the index of column
          const index = this.columnDefs.findIndex((x:any) => x.field === this.data[i][j].field);
          this.columnDefs[index]["cellRenderer"] = "datecolor"
        } 
      }
      
    }
   
  }
  errorcount(){
    for (let i = 1; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].length; j++) {
        if (this.data[i][j].isValid === false) {
          this.count.push(false);
        }
      }
    }
     // check whether the button need to disable or not
     if (this.count.length == 0) {
      return this.upload_button_disabled=false;
    } else {
      return this.upload_button_disabled=true;
    }
  }


  cellcolor(param: any) {
    if (param.value == "Missing") {
      return { color: "red" };
    } else {
      return { color: "black" };
    }
  }

  create_job(){
    
    this.showprogress=true
    this.create_job_button_disabled=true
    this.startProcessing();
  }
      
       postMultipleJobs(jobdata:any): Promise<void> {
        this.total_count=jobdata.length
       return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let url=
        xhr.open('POST', 'http://10.0.0.144:8080/corporate-customer/bulk/post-Job'); // Replace with the actual endpoint URL
        xhr.setRequestHeader('Content-Type', 'application/json');
      
        xhr.onreadystatechange = () => {
         if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
           resolve();
          } else {
           reject(new Error('Failed to post jobs'));
          }
         }
        };
      
        xhr.onerror = () => {
         reject(new Error('Failed to post jobs'));
        };
      
        xhr.send(JSON.stringify(jobdata));
       });
      }
      
    
    //    subscribeToProgressUpdates(): void {
    //    const eventSource = new EventSource('http://10.0.0.144:8080/corporate-customer/bulkpost-job',{withCredentials: true }); // Replace with the actual SSE endpoint URL
      
      
    //   eventSource.onmessage = (e) => {
    //     console.log('connection message');
    //      console.log(e.data);
    //  }
     
    //  eventSource.onopen = (e) => {
    //     console.log('connection open');
    //      console.log(e);
    //  }
      
    //    eventSource.onmessage = (event: MessageEvent) => {
    //      console.log( JSON.parse(event.data))
    //     const progressUpdate: { jobID: string; progress: number } = JSON.parse(event.data);
    //     console.log('Received progress update:', progressUpdate);
    
    //    };

    //    eventSource.onerror = (e) => {
    //     console.log('connection error');
    //      console.log(e);
    //      eventSource.close();
    //  }
      
      
    //   }
      
     async startProcessing(this: any): Promise<void> {
       
       const jobs:any = this.jobdata
      
       try {
        await this.postMultipleJobs(jobs);
        console.log('Jobs posted successfully.');
       } catch (error) {
        console.error('Error posting jobs:', error);
       }
      
    
      this.connect("http://10.0.0.144:8080/corporate-customer/bulkpost-job").subscribe((res:any,progess:any)=>{
      let data=JSON.parse(res)
      this.array_data.push(data)
      this.percentDone=Math.round((this.array.length/this.total_count) * 100)
      
       })
      
      }
      
     
     
    // this.dataService.bulkpost("corporate-customer/bulk/post-Job",this.jobdata).subscribe((event: any) => {
    //   if (event.type === HttpEventType.UploadProgress) {
    //     this.percentDone = Math.round((event.loaded / event.total) * 100)
     
    //   } else if (event instanceof HttpResponse) {
    //     this.uploadSuccess = true;
    //     this.dialogservice.openSnackBar(`${event}` +"successfully", "OK");
    //   }
    //   else if (event.type === HttpEventType.Response) {
    //     this.percentDone = 100
    //   }    
    // });
 
   
    //using server side events to get the response one by one
    connect(url: string): Observable<any> {
      return new Observable(observer => {
        this.eventSource = new EventSource(url);
  
        this.eventSource.onmessage = event => {
         
              if(event.data!='done'){
                const messageData = event.data;
                observer.next(messageData);
               
              }else if(event.data=='done'){
                this.percentDone=100
                this.eventSource.close();
                this.dialogservice.openSnackBar("Job Posted Successfully","OK")
                this.router.navigate(["corporate-dashboard/joblist"]);
              }

        };


        this.eventSource.onerror = (error: Event) => {
          console.error('SSE error:', error);
          this.eventSource.close();
         };
      });
    }




    // clicking the excel upload button 
  upload(){
    // this.dataService.postData("excel/",this.id,this.listData).subscribe((res:any)=>{
    //   let data=res.data
    //   if(res.status == 200){
    //     this.dialogservice.openSnackBar("Excel Uploaded Successfully","OK")
    //     this.jobdata=data
    //     this.upload_button_disabled=true
    //     this.create_job_button_disabled=false
    //   }

    // })
  }
}
