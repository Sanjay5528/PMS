import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import * as L from 'leaflet';

@Component({
 selector: 'formly-field-html',
 template: `
<style>
 /* Your styles here */
 .map-frame {
  border: 1px solid black;
  height: 30vh;
  width: 50%; 
 }
.map-container{
  margin-left: 25%;
  margin-top: 7%;
  margin-bottom: 1%;
}

#map {
  height: 100%;
  width: 100%;
}

.search-container {
  margin-bottom: 10px; /* Add some space between the search bar and the map */
}

#searchInput {
  padding: 5px; /* Adjust the padding as needed */
}

#searchButton {
  padding: 5px 10px; /* Adjust the padding as needed */
  margin-left: 10px; /* Add some space between the search input and button */
}
</style>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
   integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
   crossorigin=""/>
<div class="map-container">
  <div class="search-container">
    <input type="text" id="searchInput" placeholder="Search for a place">
    <button id="searchButton">Search</button>
  </div>
  <div class="map-frame">
    <div id="map"></div>
  </div>
</div>
<input type="hidden" 
      [formControl]="thisFormControl"
      [formlyAttributes]="field"
      />

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
   integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
   crossorigin=""></script>
`
,
})

export class MapComponent extends FieldType {
  private map: any;
  private marker: any;
  public get thisFormControl() {
    return this.formControl as FormControl;
  }
  
  
  
  private initMap(): void {
    this.map = L.map('map', {
        center: [13.113720622720065, 80.28026474259269],
        zoom: 18
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

    this.map.on('click', (e: any) => {
      if (this.marker && this.marker.isDragging()) {
        return; // If marker is being dragged, don't do anything on map click
      }
    });
  }
  customIcon = L.icon({
    iconUrl: 'assets/image/marker3.png',
    iconSize: [40, 40],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  ngAfterViewInit(): void {
    this.initMap();

    this.marker = L.marker([13.042304, 80.24865], { draggable: true ,icon: this.customIcon}).addTo(this.map);

    this.marker.on('dragend', async (e: any) => {
      const newLatLng = e.target.getLatLng();
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLatLng.lat}&lon=${newLatLng.lng}`);
      const data = await response.json();

      if (data.display_name) {
        const address = data.display_name;
        this.marker.bindPopup(`  Latitude: ${newLatLng.lat}<br>
        Longitude: ${newLatLng.lng}<br>Address: ${address}`).openPopup();
        
let cordinate:any={
    lat:newLatLng.lat,lng:newLatLng.lng }
    console.log(cordinate);

    this.formControl.setValue(cordinate);
        // Update the search bar with the location name
        const searchInput = document.getElementById('searchInput') as HTMLInputElement;
        searchInput.value = address;
      } else {
        this.marker.bindPopup('Address: Not available').openPopup();
      }
    });

    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;

    searchButton?.addEventListener('click', async () => {
      const searchTerm = searchInput.value;
      if (searchTerm) {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
          const searchData = await response.json();

          if (searchData.length > 0) {
            const searchResult = searchData[0];
            const searchLatLng = [parseFloat(searchResult.lat), parseFloat(searchResult.lon)];
            const newLatLng = searchLatLng;
            console.log(searchResult );

            const address = searchResult.display_name;
            console.log(address);

            this.marker.bindPopup(`Address: ${address}`).openPopup();

            // Update the search bar with the location name
            const searchInput = document.getElementById('searchInput') as HTMLInputElement;
            searchInput.value = address;
            // this.fetchAndSetAddress(newLatLng);

            this.marker.setLatLng(searchLatLng);
            this.map.setView(searchLatLng, 10);
          } else {
            console.log('No results found for the search term.');
          }
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      }
    });

  // Double-click event to move the marker to the double-clicked location
  this.map.on('dblclick', (e: any) => {
    const newLatLng = e.latlng;
    
let cordinate:any={
  lat:newLatLng.lat,lng:newLatLng.lng }
  console.log(cordinate);

  this.formControl.setValue(cordinate);
    this.marker.setLatLng(newLatLng);

    // Fetch address and update the search input
    this.fetchAndSetAddress(newLatLng);
  });
}

private async fetchAndSetAddress(latLng: any) {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latLng.lat}&lon=${latLng.lng}`);
  const data = await response.json();

  if (data.display_name) {
    const address = data.display_name;
    this.marker.bindPopup(`Address: ${address}`).openPopup();

    // Update the search bar with the location name
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    searchInput.value = address;

    console.log(address);
    
  } else {
    this.marker.bindPopup('Address: Not available').openPopup();
  }
}
  }

//   var circle = L.circle( [ 13.042304, 80.24865 ], {
//    color: 'red',
//    fillColor: '#f03',
//    fillOpacity: 0.5,
//    radius: 500000
//  }).addTo(this.map); below .openOn(this.map)
