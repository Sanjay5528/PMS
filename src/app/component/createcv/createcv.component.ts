import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { HttpClient } from '@angular/common/http';
// import { ApiService } from 'src/app/service/search.service';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-createcv',
  templateUrl: './createcv.component.html',
  styleUrls: ['./createcv.component.css'],
})
export class CreatecvComponent implements OnInit {
  Email: string = '';
  ResponseEmail: any;
  [x: string]: any;
  rows: any[] = [];
  fullname1: any;
  email1: any;
  phoneNumber1: any;
  title1: any;
  Address1: any;
  Summary1: any;
  University1: any;
  Degree1: any;
  Graduation1: any;
  GPA1: any;
  Certificate1: any;
  Authority1: any;
  Date1: any;
  Company1: any;
  Position1: any;
  startDate1: any;
  endDate1: any;
  Response1: any;
  Skill11: any;
  Skill1Lvl1: any;
  Project1: any;
  Role1: any;
  Duration1: any;
  Description11: any;
  Activity1: any;
  Description21: any;
  university: any;
  graduationDate: any;
  degree: any;
  gpa: any;
  personalInfo = false;
  summary = true;
  education = true;
  professionalExp = true;
  skills = true;
  projectExp = true;
  extraCurricular = true;
  certificate = true;
  tableRows: any[] = [];
  certificateRows: any[] = [];
  universities: string[] = [];
  degrees: string[] = [];
  graduationDates: Date[] = [];
  gpas: number[] = [];
  certificateName: string[] = [];
  authority: string[] = [];
  dateEarned: Date[] = [];
  description: string[] = [];
  company: string[] = [];
  position: string[] = [];
  startDate: Date[] = [];
  endDate: Date[] = [];
  responsibilities: string[] = [];
  skillName: string[] = [];
  skillLevel: string[] = [];
  projectName: string[] = [];
  role: string[] = [];
  duration: number[] = [];
  description1: string[] = [];
  Activity: string[] = [];
  description2: string[] = [];
  obj4: any = {};
  whole4: any[] = [];
  obj5: any = {};
  whole5: any[] = [];
  allValues: any = {};
  obj2: any = {};
  whole2: any[] = [];
  obj3: any = {};
  whole3: any[] = [];
  obj1: any = {};
  whole1: any[] = [];
  obj: any = {};
  whole: any[] = [];
  educationDetails: any[] = [];
  extra = {};
  skillRows: any[] = [];
  skillRows1: any[] = [];
  workexperience: any[] = [];


  hobbiesArray = new FormArray([new FormControl('', Validators.required)]);
   constructor(private http: HttpClient) {
    // if (this.auth.decodeToken()) {
    //   this.Email = this.auth.decodeToken().email;
    // }
  }

  ngOnInit() {

    if (this.Email !== '') {
      this.http
        .get<any>(`http://127.0.0.1:8080/auth/user_resume/${this.Email}`)
        .subscribe({
          next: (data: any) => {
            if (data.email == this.Email) {
              this.populateFormFields(data);
              console.log(data.email);
              this.ResponseEmail = data.email;
              this.getUserValues();
              this.getUserValues1();
              this.getUserValues2();
              this.getUserValues3();
              this.getUserValues4();
              this.getUserValues5();
            }
          },
          error(err) {
            console.error(err);
          },
        });
    }

  }

  populateFormFields(data: any) {
    this.fullname1 = data.fullname;
    this.title1 = data.title;
    this.email1 = data.email;
    this.phoneNumber1 = data.phoneNumber;
    this.Address1 = data.address;
    this.Summary1 = data.summary;
    this.universities = [];
    this.degrees = [];
    this.graduationDates = [];
    this.gpas = [];
    this.company = [];
    this.position = [];
    this.startDate = [];
    this.endDate = [];
    this.responsibilities = [];
    this.skillName = [];
    this.skillLevel = [];
    this.projectName = [];
    this.role = [];
    this.duration = [];
    this.description1 = [];
    this.Activity = [];
    this.description2 = [];

    for (let i = 0; i < data.educationDetails.length; i++) {
      this.universities[i] = data.educationDetails[i].university;
      this.degrees[i] = data.educationDetails[i].degree;
      this.graduationDates[i] = data.educationDetails[i].graduationDate;
      this.gpas[i] = data.educationDetails[i].gpa;
    }
    for (let i = 0; i < data.certificates.length; i++) {
      this.certificateName[i] = data.certificates[i].certificate;
      this.authority[i] = data.certificates[i].authority;
      this.dateEarned[i] = data.certificates[i].dateEarned;
      this.description[i] = data.certificates[i].description;
    }

    for (let i = 0; i < data.workExperience.length; i++) {
      this.company[i] = data.workExperience[i].company;
      this.position[i] = data.workExperience[i].position;
      this.startDate[i] = data.workExperience[i].startDate;
      this.endDate[i] = data.workExperience[i].endDate;
      this.responsibilities[i] = data.workExperience[i].responsibilities;
    }

    for (let i = 0; i < data.skills.length; i++) {
      this.skillName[i] = data.skills[i].skill;
      this.skillLevel[i] = data.skills[i].level;
    }

    for (let i = 0; i < data.projectsExperience.length; i++) {
      this.projectName[i] = data.projectsExperience[i].project;
      this.role[i] = data.projectsExperience[i].role;
      this.duration[i] = data.projectsExperience[i].duration;
      this.description1[i] = data.projectsExperience[i].description;
    }
    for (let i = 0; i < data.extraCurricular.length; i++) {
      this.Activity[i] = data.extraCurricular[i].activity;
      this.description2[i] = data.extraCurricular[i].description2;
    }

    this.tableRows = data.educationDetails;
    this.certificateRows = data.certificates;
    this.workexperience = data.workExperience;
    this.skillRows = data.skills;
    this.projectRows = data.projectsExperience;
    this.skillRows1 = data.extraCurricular;

    console.log(data);
  }

   cl1(value: any) {
    this.personalInfo = true;
    this.summary = true;
    this.education = true;
    this.certificate = true;
    this.professionalExp = true;
    this.skills = true;
    this.projectExp = true;
    this.extraCurricular = true;
    this.personalInfo = value;
    console.log(this.fullname1);
    console.log(this.email1);
    console.log(this.phoneNumber1);
    console.log(this.title1);
    console.log(this.Address1);
  }
  cl2(value: any) {
    this.personalInfo = true;
    this.education = true;
    this.professionalExp = true;
    this.skills = true;
    this.certificate = true;
    this.projectExp = true;
    this.extraCurricular = true;
    this.personalInfo = true;
    this.summary = value;
    console.log(this.Summary1);
  }
  cl3(value: any) {
    this.personalInfo = true;
    this.summary = true;
    this.certificate = true;
    this.professionalExp = true;
    this.skills = true;
    this.projectExp = true;
    this.extraCurricular = true;
    this.professionalExp = true;
    this.education = value;
  }

  cl4(value: any) {
    this.personalInfo = true;
    this.summary = true;
    this.education = true;
    this.certificate = true;
    this.skills = true;
    this.projectExp = true;
    this.extraCurricular = true;
    this.professionalExp = value;
  }
  cl5(value: any) {
    this.personalInfo = true;
    this.summary = true;
    this.education = true;
    this.professionalExp = true;
    this.certificate = true;
    this.projectExp = true;
    this.extraCurricular = true;
    this.skills = value;
  }
  cl6(value: any) {
    this.personalInfo = true;
    this.summary = true;
    this.education = true;
    this.professionalExp = true;
    this.skills = true;
    this.certificate = true;
    this.extraCurricular = true;
    this.projectExp = value;
  }
  cl7(value: any) {
    this.personalInfo = true;
    this.summary = true;
    this.education = true;
    this.professionalExp = true;
    this.skills = true;
    this.projectExp = true;
    this.certificate = true;
    this.extraCurricular = value;
  }
  cl8(value: any) {
    this.personalInfo = true;
    this.summary = true;
    this.education = true;
    this.professionalExp = true;
    this.skills = true;
    this.projectExp = true;
    this.extraCurricular = true;
    this.certificate = value;
  }




  addInputControl() {
    this.hobbiesArray.push(new FormControl('', Validators.required));
  }
  removeInputControl(idx: number) {
    this.hobbiesArray.removeAt(idx);
  }
  addRow() {
    this.tableRows.push({
      university: '',
      degree: '',
      graduationDate: '',
      gpa: null,
    });
  }

  deleteRow(index: number) {
    this.tableRows.splice(index, 1);
  }

  addCertificateRow() {
    this.certificateRows.push({
      certificateName: '',
      authority: '',
      dateEarned: '',
    });
  }

  deleteCertificateRow(index: number) {
    this.certificateRows.splice(index, 1);
  }


  addWorkExperienceRow() {
    this.workexperience.push({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      responsibilities: '',
    });
  }

  deleteWorkExperienceRow(index: number) {
    this.workexperience.splice(index, 1);
  }

  extraAdd() {
    this.extra = {
      university: this.university,
      degree: this.degree,
      graduationDate: this.graduationDate,
      gpa: this.gpa,
    };
    console.log(this.extra);
  }

  addSkillRow() {
    this.skillRows.push({
      skillName: '',
      skillLevel: '',
    });
  }

  deleteSkillRow(index: number) {
    this.skillRows.splice(index, 1);
  }
  addSkillRow1() {
    this.skillRows1.push({
      skillName: '',
      skillLevel: '',
    });
  }

  deleteSkillRow2(index: number) {
    this.skillRows1.splice(index, 1);
  }

  projectRows: any[] = [];

  addProjectRow() {
    this.projectRows.push({
      projectName: '',
      role: '',
      duration: '',
      description: '',
    });
  }

  deleteProjectRow(index: number) {
    this.projectRows.splice(index, 1);
  }



  getUserValues() {
    for (let i = 0; i < this.universities.length; i++) {
      this.obj = {};
      this.obj['University'] = this.universities[i];
      this.obj['Degree'] = this.degrees[i];
      this.obj['GraduationDate'] = this.graduationDates[i];
      this.obj['GPA'] = this.gpas[i];
      this.whole.push(this.obj);
    }

  }

  getUserValues1() {
    for (let i = 0; i < this.certificateName.length; i++) {
      this.obj1 = {};
      this.obj1['Certificate'] = this.certificateName[i];
      this.obj1['Authority'] = this.authority[i];
      this.obj1['DateEarned '] = this.dateEarned[i];
      this.obj1['Description'] = this.description[i];
      this.whole1.push(this.obj1);
    }
    console.log(this.obj1);
    console.log(this.whole1);
  }

  getUserValues2() {
    for (let i = 0; i < this.company.length; i++) {
      this.obj2 = {};
      this.obj2['Company'] = this.company[i];
      this.obj2['Position'] = this.position[i];
      this.obj2[' StartDate  '] = this.startDate[i];
      this.obj2['EndDate'] = this.endDate[i];
      this.obj2['Responsibilities'] = this.responsibilities[i];

      this.whole2.push(this.obj2);
    }
    console.log(this.obj2);
    console.log(this.whole2);
  }

  getUserValues3() {
    for (let i = 0; i < this.skillName.length; i++) {
      this.obj3 = {};
      this.obj3['Skill'] = this.skillName[i];
      this.obj3['Level'] = this.skillLevel[i];

      this.whole3.push(this.obj3);
    }
    console.log(this.obj3);
    console.log(this.whole3);
  }

  getUserValues4() {
    for (let i = 0; i < this.projectName.length; i++) {
      this.obj4 = {};
      this.obj4['Project'] = this.projectName[i];
      this.obj4['Role'] = this.role[i];
      this.obj4['Duration '] = this.duration[i];
      this.obj4['Description1'] = this.description1[i];
      this.whole4.push(this.obj4);
    }
    console.log(this.obj4);
    console.log(this.whole4);
  }

  getUserValues5() {
    for (let i = 0; i < this.Activity.length; i++) {
      this.obj5 = {};
      this.obj5['Activity'] = this.Activity[i];
      this.obj5['Description2'] = this.description2[i];

      this.whole5.push(this.obj5);
    }
    console.log(this.obj5);
    console.log(this.whole5);
  }

  total() {

    this.allValues['FullName'] = this.fullname1;
    this.allValues['Title'] = this.title1;
    this.allValues['Email'] = this.email1;
    this.allValues['PhoneNumber'] = this.phoneNumber1;
    this.allValues['Address'] = this.Address1;
    this.allValues['Summary'] = this.Summary1;
    this.allValues['EducationDetails'] = this.whole;
    this.allValues['Certificates'] = this.whole1;
    this.allValues['workexperience'] = this.whole2;
    this.allValues['Skills'] = this.whole3;
    this.allValues['ProjectsExperience'] = this.whole4;
    this.allValues['ExtraCurricular'] = this.whole5;
    console.log('====================================');
    console.log(this.allValues);
    console.log('====================================');
  }

  generate() {

    const documentDefinition = {
      content: [
        {
          text: this.fullname1,
          style: 'header',
          alignment: 'center',
        },
        {
          text: this.title1,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 10],
        },
        {
          text: 'Contact Information',
          style: 'sectionHeader',
          margin: [0, 10],
        },
        {
          ul: [
            { text: `Email: ${this.email1}`, margin: [0, 5] },
            { text: `Phone: ${this.phoneNumber1}`, margin: [0, 5] },
            { text: `Address: ${this.Address1}`, margin: [0, 5] },
          ],
          margin: [0, 10],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 10,
              x2: 520.276,
              y2: 10,
              lineWidth: 1,
            },
          ],
        }, // Line separator

        {
          text: 'Summary',
          style: 'sectionHeader',
          margin: [0, 10],
        },
        {
          text: this.Summary1,
          margin: [0, 10],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 10,
              x2: 520.276,
              y2: 10,
              lineWidth: 1,
            },
          ],
        }, // Line separator

        {
          text: 'Experience',
          style: 'sectionHeader',
          margin: [0, 10],
        },
        {
          ul: this.whole2.map((experience: any) => {
            return [
              {
                columns: [
                  {
                    width: '*',
                    text: `Company: ${experience.Company}`,
                    margin: [0, 5],
                  },
                  {
                    width: 'auto',
                    text: `${experience[' StartDate  ']} - ${experience['EndDate']}`,
                    alignment: 'right',
                    margin: [0, 5],
                  },
                ],
                columnGap: 10,
              },
              { text: `Position: ${experience.Position}`, margin: [0, 5] },
              {
                text: `Responsibilities: ${experience.Responsibilities}`,
                margin: [0, 5],
              },
            ];
          }),
          margin: [0, 10],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 10,
              x2: 520.276,
              y2: 10,
              lineWidth: 1,
            },
          ],
        }, // Line separator

        {
          text: 'Education',
          style: 'sectionHeader',
          margin: [0, 10],
        },
        {
          ul: this.whole.map((education: any) => {
            return [
              { text: `University: ${education.University}`, margin: [0, 5] },
              { text: `Degree: ${education.Degree}`, margin: [0, 5] },
              {
                text: `Graduation Date: ${education['GraduationDate']}`,
                margin: [0, 5],
              },
              { text: `GPA: ${education.GPA}`, margin: [0, 5] },
            ];
          }),
          margin: [0, 10],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 10,
              x2: 520.276,
              y2: 10,
              lineWidth: 1,
            },
          ],
        }, // Line separator

        {
          text: 'Skills',
          style: 'sectionHeader',
          margin: [0, 10],
        },
        {
          ul: this.whole3.map((skill: any) => {
            return {
              text: ` ${skill.Skill}  (Skill Level: ${skill['Skill Level']})`,
              margin: [0, 5],
            };
          }),
          margin: [0, 10],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 10,
              x2: 520.276,
              y2: 10,
              lineWidth: 1,
            },
          ],
        }, // Line separator

        {
          text: 'Project Experience',
          style: 'sectionHeader',
          margin: [0, 10],
        },
        {
          ul: this.whole4.map((project: any) => {
            return [
              { text: `Project Name: ${project.Project}`, margin: [0, 5] },
              { text: `Role: ${project.Role}`, margin: [0, 5] },
              { text: `Duration: ${project['Duration ']}`, margin: [0, 5] },
              { text: `Description: ${project.Description1}`, margin: [0, 5] },
            ];
          }),
          margin: [0, 10],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 10,
              x2: 520.276,
              y2: 10,
              lineWidth: 1,
            },
          ],
        }, // Line separator

        {
          text: 'Extracurricular Activities',
          style: 'sectionHeader',
          margin: [0, 10],
        },
        {
          ul: this.whole5.map((activity: any) => {

            return [
              { text: `Activity Name: ${activity.Activity}`, margin: [0, 5] },
              {
                text: `Description: ${activity['Description2']}`,
                margin: [0, 5],
              },
            ];
          }),
          margin: [0, 10],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 10,
              x2: 520.276,
              y2: 10,
              lineWidth: 1,
            },
          ],
        }, // Line separator
      ],

      styles: {
        header: {
          fontSize: 24,
          bold: true,
          marginBottom: 10,
        },
        subheader: {
          fontSize: 18,
          bold: true,
          marginBottom: 10,
        },
        sectionHeader: {
          fontSize: 16,
          bold: true,
          marginBottom: 10,
        },
        listItem: {},
      },
    };

    (pdfMake as any).createPdf(documentDefinition).download('resume.pdf');
  }

  resume() {
    
    this.total();
    console.log(this.allValues);

    if (this.Email == this.ResponseEmail) {

      this.http
        .put(`http://127.0.0.1:8080/auth/user_resume/${this.Email}`,this.allValues )
        .subscribe({
          next: (data: any) => {
            console.log(data.message);
          },
          error(err) {
            console.log(err);
            // alert(err.message);
          },
        });
    } else {

      this.http
        .post('http://127.0.0.1:8080/auth/user_resume', this.allValues)
        .subscribe({
          next: (data: any) => {
            console.log(data.message);
          },
          error(err) {
            console.log(err);
            // alert(err.message);
          },
        });
    }
  }
  userDetails() {
    console.log(this.allValues);
    this.http
      .post('http://127.0.0.1:8080/auth/user_details', this.allValues)
      .subscribe({
        next: (data: any) => {
          console.log(data.message);
        },
        error(err) {
          console.log(err);
          alert(err.message);
        },
      });
  }
}