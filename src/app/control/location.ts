import { FieldType, } from '@ngx-formly/core';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import * as geolib from 'geolib';
import * as turf from '@turf/turf';
import { FormControl } from '@angular/forms';
import { LocationService, Maps } from '../services/location-service';
interface Entry {
  place: google.maps.places.PlaceResult;
  marker: google.maps.Marker;


  ellipse: google.maps.Polygon;

  location: any; // Replace 'any' with the actual type of location if available
}

let colorIndex = 0;

const place = null as unknown as google.maps.places.PlaceResult;
type Components = typeof place.address_components;

@Component({
  selector: 'location',
  template: `

  <style>p {
    font-family: Lato;
  }
  
  dl {
    font-size: 13px;
  }
  
  dl code {
    padding: 0 3px;
    border: 1px solid #ccc;
    white-space: nowrap;
  }
  
  input[type=text] {
    width: 300px;
    padding: 3px;
  }
  
  table {
    margin: 10px 0;
    border: 1px solid red;
  }
  
  th, td, code, dt {
    font-family: 'Source Code Pro';
    font-size: 12px;
  }
  
  .map {
    margin: 10px 0;
    height: 400px;
    max-width: 900px;
  }
 
  .button-container {
    display: flex;
    align-items: center;
  }

 
  .custom-button {
    background-color: #4CAF50; 
    color: white; 
 
    border: none; 
    cursor: pointer;
    border-radius: 4px; 
    font-size: 16px; 
    margin-left: 10px; 
  }
  
  .custom-button:hover {
    background-color: #45a049;
  }


  </style>
  <div *ngIf="show== true" class="button-container">
  <input 
    placeholder={{field.props.label}}
    autocorrect="off"
    autocapitalize="off"
    spellcheck="off"
    type="text"
    class="form-control"
    [formControl]="FormControl"  
  [formlyAttributes]="field"
    #search
  />
  <button (click)="searchLocation()" class="custom-button">Search</button>
</div>


<div class="map" #map></div>

  `
})

export class Location extends FieldType<any>  {
  @ViewChild('search')
  public searchElementRef!: ElementRef;
  public geoCoder!: any;
  @ViewChild('map')
  public mapElementRef!: ElementRef;
  show: boolean = true
  public entries: Entry[] = [];
  private currentMarker: google.maps.Marker | null = null;
  public place!: google.maps.places.PlaceResult;

  private map!: google.maps.Map;
  private geocoder!: google.maps.Geocoder;

  constructor(locationService: LocationService, private ngZone: NgZone) {
    super();
    locationService.api.then((maps) => {
      this.initAutocomplete(maps);
      this.initMap(maps);
    });
    // this.geocoder = new google.maps.Geocoder();

  }

  public get FormControl() {
    return this.formControl as FormControl;
  }




  initAutocomplete(maps: Maps) {

    this.show = this.field.showsearchbar
    let autocomplete = new maps.places.Autocomplete(
      this.searchElementRef?.nativeElement
    );
    console.log(autocomplete)
    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        this.onPlaceChange(autocomplete.getPlace());
      });
    });



  }

  initMap(maps: Maps) {
    this.show = this.field.showsearchbar
    let center
    let location = this?.model[this?.field.key]
    console.log(location);
    
    if (location != undefined) {
      center = new google.maps.LatLng(location.lng, location.lat);
    } else {
      center = new google.maps.LatLng(80.28108535441856,13.113773744255758);

    }
    this.map = new maps.Map(this.mapElementRef.nativeElement, {
      zoom: 7,
      center: center
    });

    this.currentMarker = new google.maps.Marker({
      position: center,
      animation: google.maps.Animation.DROP,
      map: this.map,
      draggable: this.field.draggable,
    });
    this.map.setCenter(center);
    this.map.setZoom(15);
    this.currentMarker.addListener("dragend", () => {
      // patch the  lat and long in control
      let location:any= this.currentMarker?.getPosition() as google.maps.LatLng
      if(location!=undefined){
        this.geocoder = new google.maps.Geocoder();
        this.geocoder.geocode({ location }, (results:any, status:any) => {
          if (status === "OK" && results[0]) {
            console.log(results[0]);
            
            const formattedAddress = results[0].formatted_address;
          this.searchElementRef.nativeElement.value = formattedAddress;
      
          }})
       }
       const coordinates = {
            lng: location.lng(),
            lat:  location.lat()
          }
     this.formControl.setValue(coordinates)
      //   this.formControl.setValue(coordinates)=coordinates
      console.log(this.formControl.value)
       });
    // While drag the Marker
    // marker.addListener("dragend", () => {
    //   let location = marker.getPosition() as google.maps.LatLng

    //   let coordinates = {
    //     lng: location.lng(),
    //     lat:  location.lat()
    //   }
   
    //    this.formControl.setValue(coordinates) = coordinates
    //   console.log(this.formControl.value)
    // });
    // this.currentMarker=marker
  }



  searchLocation() {
    const searchInput = this.searchElementRef.nativeElement;
    const searchQuery = searchInput.value;


    if (searchQuery) {
      const autocomplete = new google.maps.places.AutocompleteService();
      autocomplete.getPlacePredictions(
        {
          input: searchQuery,
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            if (predictions && predictions.length > 0) {
              const firstPrediction = predictions[0];
              if (firstPrediction.place_id) {
                const placesService = new google.maps.places.PlacesService(this.map);
                placesService.getDetails(
                  {
                    placeId: firstPrediction.place_id,
                  },
                  (place: any, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                      this.onPlaceChange(place);
                      this.map.setCenter(place.geometry!.location!);
                      this.map.setZoom(15); // Adjust the zoom level as per your requirements
                    }
                  }
                );
              }
            }
          }
        }
      );
    }

  }

  onPlaceChange(place: google.maps.places.PlaceResult) {

    // this.map.setCenter(place.geometry!.location!);
    console.log(place.geometry!.location)

    const marker = new google.maps.Marker({
      position: place.geometry!.location,
      animation: google.maps.Animation.DROP,
      map: this.map,
      draggable: true,
    });



    // While drag the Marker
    marker.addListener("dragend", () => {
      // patch the  lat and long in control
      let location = marker.getPosition() as google.maps.LatLng
      this.geocoder = new google.maps.Geocoder();
        this.geocoder.geocode({ location }, (results:any, status:any) => {
          if (status === "OK" && results[0]) {
            console.log(results[0]);
            
            const formattedAddress = results[0].formatted_address;
          this.searchElementRef.nativeElement.value = formattedAddress;
      
          }})
      //  }
      let coordinates = {
        lng: location.lng(),
        lat:  location.lat()
      }
      console.log(coordinates,'dragend');

      const formattedAddress = place.formatted_address;
      console.log(formattedAddress);
      
      this.searchElementRef.nativeElement.value =formattedAddress;
       this.formControl.setValue(coordinates);
      // console.log(this.formControl.value)
    });





    if (this.currentMarker) {
      this.currentMarker.setMap(null);
    }
    this.currentMarker = marker;

 
      let location = marker.getPosition() as google.maps.LatLng
      const coordinates =
      {
        lng: location.lat(),
        lat: location.lng(),
      }
console.log(coordinates);
this.geocoder = new google.maps.Geocoder();
this.geocoder.geocode({ location }, (results:any, status:any) => {
  if (status === "OK" && results[0]) {
    console.log(results[0]);
    
    const formattedAddress = results[0].formatted_address;
  this.searchElementRef.nativeElement.value = formattedAddress;

  }})
this.map.setCenter(location);

 this.formControl.setValue(coordinates)
  }
}

// Json For the above 
// {
// "type": "location",
//  "key": "location", 
//  "className": "flex-2",
//   "showsearchbar": true,
//    "draggable": true, 
//    "props": 
//    {
//      "label": "Block Location", 
//      "placeholder": "Block Location" 
//     }
//    },