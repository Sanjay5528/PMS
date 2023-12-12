import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { FormService } from 'src/app/services/form.service';
import { HelperService } from 'src/app/services/helper.service';
import { environment } from 'src/environments/environment';
import { FieldType} from '@ngx-formly/material/form-field';
import { FormlyFieldSelectAutocomplete} from 'src/app/control/select-autocomplete.type'
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})




export class EventComponent  implements OnInit {

  constructor(private formBuilder: FormBuilder, public dialogService: DialogService, private helperServices: HelperService, public dataService: DataService, private formService: FormService,) {
    // super()
  }
  @Input('model') model: any = {}
  @Input("Data") Data: any = {}
 
  // constructor(private formBuilder: FormBuilder,private dataService:DataService,private helperServices: HelperService,public dialogService: DialogService,private formService: FormService){
  //   super()
  // }
  isUser=false;
  
  
  buttonInputOptions = [
    // 'One',
    // 'Two',
    // 'Three'
  ];



  public searchText: FormControl = new FormControl('', []);
  public search = { searchText: '' };


  clearSearch() {
    this.searchText.setValue('');
    this.search.searchText = '';
  }

  // GetUser(event: any) {
  //   // throw new Error('Method not implemented.');

  //   const filterCondition = {
  //     filter: [
  //       { clause: "AND",
  //         conditions: [
  //           {
  //             column: "model_name",
  //             operator: "IN",
  //             value: modelName,
  //           }
  //         ]
  //       }
  //     ]
  //   }}


  // }
    // this.dataService.getDataByFilter("data_model", filterCondition).subscribe(  (res: any) => {
  
  
  
  
  
  
  
  
    // })






  
  
  collectionName = "event_participate"
  
  butText = 'save'
  imageUrl: any
  // form = this.formBuilder.group({});
  form = new FormGroup({});

  myControl: FormControl = new FormControl();

  options: FormlyFormOptions = {};
  inputWidth = '300px';

  autofields: FormlyFieldConfig  []=[ 



    {
      key: '_id',
      type: 'autocomplete-input',
      templateOptions: {
        label: 'Autocomplete Field',
        placeholder: 'Start typing to search...',
        optionsDataSource: {
          collectionName: 'user',
          filter: {},
        },
        labelProp: 'name',
        valueProp: '_id',
        onValueChangeUpdate: {
          key: 'anotherFieldToUpdate',
          labelProp: 'additionalInfo',
        },
      },
    }












 ]

  inputFields: FormlyFieldConfig[] = [
    {
      key: '_id',
      type: 'autocomplete-input',
      templateOptions: {
        label: 'Autocomplete Field',
        placeholder: 'Start typing to search...',
        optionsDataSource: {
          collectionName: 'user',
          filter: {},
        },
        labelProp: 'name',
        valueProp: '_id',
        onValueChangeUpdate: {
          key: 'anotherFieldToUpdate',
          labelProp: 'additionalInfo',
        },
      },
    },
    {
      key: 'username',
      type: 'input',
      templateOptions: {
        label: 'Full Name',
        placeholder: 'Enter your Full name',
        required: true,
      },
    },
    {
      key: 'emailId',
      type: 'input',
      templateOptions: {
        label: 'Email ID',
        placeholder: 'Enter your email address',
        required: true,
        type: 'email',
      },
    },
    {
      key: 'mobile_number',
      type: 'input',
      templateOptions: {
        label: 'Mobile Number',
        placeholder: 'Enter your mobile number',
        required: true,

      },
    },
    {
      key: 'gender',
      type: 'select',
      templateOptions: {
        label: 'Gender',
        placeholder: 'Select your gender',
        required: true,
        options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' },
        ],
      },
    },
    {
      key: 'profileDescription',
      type: 'html-input',
      templateOptions: {
        label: 'Profile Description',
        placeholder: 'Write a brief description about yourself',
      },
    },
  ];
 
  checkbox = this.formBuilder.group({
    delegates: ['']
  });



//  forms = this.formBuilder.group({
//     // delegates: ['']
//   });
  getFromData() {
    const filterCondition1 = {
      filter: [{
        clause: "AND",
        conditions: [
          { column: '_id', operator: "EQUALS", value: "parthi@kriyatec.com" },
        ],

      }]
    };

    this.dataService.getDataByFilter("user", filterCondition1).subscribe((res: any) => {

      const userData = res.data[0].response[0];
      console.log(userData);

    })



  }


  // private _filter(value: string): string[] {
  //   const filterValue = value.toLowerCase();

  //   // return this.options.filter(option => option.toLowerCase().includes(filterValue));
  // }


  ngOnInit() {
    this.imageUrl = environment?.ImageBaseUrl + "test_case/testclientID-R1-TC3/Screenshot from 2023-09-28 19-56-57__2023-11-23-18-37-05.png"
    this.getFromData()
  // isnewuse:boolean=false

  }


  saveForm() {
    // let ccheckbox:any = this.checkbox.value
    let values: any = this.form.value;
    // let all = { ...values, ...ccheckbox }

    // console.log(all);
    // let vv:any[]=[]
     
    //   for (const iterator in ccheckbox) {
    //     console.log(iterator);
        
    //     let obj:any = ccheckbox[iterator]
    //     console.log(obj);
        
    //     let vals=filterTrueValues(obj)
    //     console.log(vals);
    //     vv.push(vals)
        
    //   }
// });

// let vals=filterTrueValues(ccheckbox)
// console.log(vals);
// vv.push(vals)
//     function filterTrueValues(obj:any) {
//       return Object.fromEntries(
//         Object.entries(obj).filter(([key, value]) => value === true)
//       );
//     }
    
// console.log(vv)


    this.dataService.save(this.collectionName, values).subscribe((data: any) => {
      console.log(data);
      this.form.reset()

    })




  }





  filteredOptions: any[]=[];
  // filteredOptions!: Observable<string[]>;
  opt:any
  //default prop setting
 data:any={}
  valueProp = "_id"
  labelProp = "name"
  onValueChangeUpdate :any
//   public get FormControl() {
//    return this.formControl as FormControl;
//  }
 
  //  ngOnInit(): void {
  //    this.opt = this.field.props || {};
  //    if (!this.to.optionsDataSource || this.to.options) {
  //      return;
  //    }
  //    this.labelProp = this.opt.labelProp
  //    this.valueProp = this.opt.valueProp
  //    this.onValueChangeUpdate = this.opt.onValueChangeUpdate
  //    if (this.to.optionsDataSource.methodName) {
  //      this.data=this?.to
  //     (this.dataService[this.data.optionsDataSource.methodName](this.dataService.getDataByPath(this.field.parent, this.to.optionsDataSource.param)) as Observable<any>)
  //      .subscribe((res:any)=>{
  //         this.dataService.buildOptions(res,this.opt)
  //      })
  //    } else
  //    const filterCondition1 = {filter:[
  //     {
  //     clause: 'AND',
  //     conditions: [
  //       { column: 'org_type', operator: 'EQUALS',type:'string', value: this.Viewdata._id },
  //     ]
  //   }
  // ]};


  //     if ("user") {
  //     this.dataService.getDataByFilter("user",filterCondition1)
  //     .subscribe((res :any)=>{

  //       console.log(res)
  //         this.dataService.buildOptions(res.data[0].response,this.opt)
  //     })
  //    }
  //    this.formControl.valueChanges.subscribe((val:any)=>{
  //        const filterValue = val.toLowerCase();
  //        this.filteredOptions = this.opt.options.filter((option:any) => option.name.toLowerCase().includes(filterValue));
  //    })
 
 
 
 
  //  }
 
  //  selectionChange(ctrl:any,inputObj:any){
  //     let obj = this.filteredOptions.find(o=>o[this.valueProp] == ctrl.formControl.value)
  //     if (obj) inputObj.value = obj[this.labelProp]
  //     if (this.onValueChangeUpdate) {
  //     //  ctrl.formControl.parent.controls[this.onValueChangeUpdate.key].setValue(obj[this.onValueChangeUpdate.labelProp])
  //      //ctrl.model[this.onValueChangeUpdate.key] = obj[this.onValueChangeUpdate.labelProp]
  //     }
  //  }















  onInputChange(){
    const inputValue = this.myControl.value;
     console.log(inputValue)
    var filterCondition1 = {
  filter: [
    {
      clause: "AND",
      conditions: [
        {
          column: "_id",
          operator: "EQUALS",
          value: inputValue,
        },
      ],
    },
  ],
};

this.dataService.getDataByFilter("user", filterCondition1).subscribe((res: any) => {

  const userData = res.data[0].response[0];
  console.log("ssssssssssssssssssssssssssssssssssssssss",userData.name);
  // this.filteredOptions = userData.name;
  // console.log();
  // this.filteredOptions = [userData];

//    this.myControl.valueChanges.pipe(
//     startWith(''),
//     map((value) => {


// console.log(value)
//       this.opt.options=[]   

// let datas:any={}
// datas[this.labelProp]=userData[this.labelProp]
// datas[this.valueProp]=userData[this.valueProp]
// this.filteredOptions.push(datas)
// this.opt.options.push(datas)
//     })
//   );
  // startWith(''),
  // map(value => this._filter(value))
})
console.log(this.filteredOptions);
}
   




// private _filter(value: string): any[] {
//   const filterValue = value.toLowerCase();
//   // Implement your filtering logic if needed
//     // this.filteredOptions.forEach
// }









}
