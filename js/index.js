var markers=[];
var map;
var infoWindow;
var icons = {
    url:"https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00704a"
    //size: new google.maps.Size(71, 71),
    //scaledSize: new google.maps.Size(25, 25)
};
var LA ={
  lat:34.0522,
  lng:-118.2437
}

var styles={
  default:[
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.business",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }
  ],
  dark:[
    {elementType: 'geometry', stylers: [{color: '#005e70'}]},
    {elementType: 'labels.text.stroke', stylers: [{color: '#005e70'}]},
    {elementType: 'labels.text.fill', stylers: [{color: '#ffffff'}]},
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
              { visibility: "off" }
        ]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{color: '#38414e'}]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{color: '#212a37'}]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [
        {visibility: "off"}
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{color: '#746855'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{color: '#1f2835'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{color: '#f3d19c'}]
    },

  ],
  latte:[
    {elementType: 'geometry', stylers: [{color: '#d7d8d3'}]},
    {elementType: 'labels.text.stroke', stylers: [{color: '#bc904f'}]},
    {elementType: 'labels.text.fill', stylers: [{color: '#ffffff'}]},
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
              { visibility: "off" }
        ]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [
        {visibility: "off"}
      ]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{color: '#6987aa'}]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{color: '#988672'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{color: '#3b5e8b'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{color: '#c0a06e'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d7d8d3'}]
    }
  ]
};

function initMap() {
    

    map = new google.maps.Map(document.getElementById('map'), {
    center: LA,
    zoom: 13,
    zoomControl:false,
    rotateControl:false,
    streetViewControl:false,
    mapTypeControl:false
    });

    var styleControl = document.getElementById('style-selector-control');
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(styleControl);

    // Set the map's style to the initial value of the selector.
    var styleSelector = document.getElementById('style-selector');
    map.setOptions({styles: styles[styleSelector.value]});

    // Apply new JSON when the user selects a different style.
    styleSelector.addEventListener('change', function() {
    map.setOptions({styles: styles[styleSelector.value]})});

    infoWindow = new google.maps.InfoWindow();
    searchStores();
}

function onLoad(){
  setTimeout(visibleSwitch(), 4000);
}

function visibleSwitch(){
  document.getElementById("app").style.visibility="visible";
  document.getElementById("loadscreen").style.visibility="hidden";
}

function displayStores(stores){
    var storesHtml ="";
    if(stores.length===0){
      storesHtml+=`<div class="errormessage">
      <i class="far fa-frown-open"></i>
      Oh no! It seems like we don't have a store at your entered zipcode.
      </div>`
    }
    else{
      stores.forEach(function(store,index){
          var address= store.addressLines;
          var phone= store.phoneNumber;
          
          storesHtml +=`<div class="store-container"> 
          <div class="store-container-back">
            <div class="store-info">
                <div class="store-address">
                    <span>${address[0]}</span>
                    <span>${address[1]}</span>                  
                </div>
                <div class="store-phone">
                    ${phone}
                </div>
            </div>
            <div class="numberCircle">
                <div class="number">${index+1}</div>
            </div>
          </div>
      </div>
      <hr>`
      });
    }
    document.querySelector('.stores').innerHTML = storesHtml;
}

function setOnClickListener(){
    var storeElements=document.querySelectorAll('.store-container');
    var inputbox=document.getElementById('zip-code-input');
    storeElements.forEach(function(elem,index){
      elem.addEventListener('click',function(){
        google.maps.event.trigger(markers[index],'click');
        markers[index].setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){ markers[index].setAnimation(null); }, 750);
      });
    });
    inputbox.addEventListener('keydown',function(e){
      if(e.keyCode===13){
        searchStores();
      }
    });
}

function clearLoca(){
  infoWindow.close();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers.length = 0;
}

function showMarkers(stores) {
    if(stores.length!==0){
      var bounds = new google.maps.LatLngBounds();
      stores.forEach(function(store, index){
          var latlng = new google.maps.LatLng(
              store.coordinates.latitude,
              store.coordinates.longitude);
          var name = store.name;
          var address = store.addressLines[0];
          var status=store.openStatusText;
          var number=store.phoneNumber;
          var loc=[store.coordinates.latitude,store.coordinates.longitude];
          bounds.extend(latlng);
          createMarker(latlng, name, address, status,number,loc);
      })
      map.fitBounds(bounds);
    }
    else{
      map.setCenter(LA);
      map.setZoom(13);
    }
}

function searchStores(){
  var matched=[];
  var zipCode=document.getElementById('zip-code-input').value;
  if(zipCode){
    stores.forEach(function(store){
      var postal=store.address.postalCode.substring(0,5);
      if(zipCode==postal){
        matched.push(store);
      }
    });
  }
  else{
    matched=stores;
  }
  clearLoca();
  displayStores(matched);
  showMarkers(matched);
  setOnClickListener();
}


function createMarker(latlng, name, address, status,number,loc) {
    var link="https://www.google.com/maps/dir/?api=1&destination="+loc[0]+"%2C"+loc[1];
    var html = `<div class="name"> 
                    ${name} 
                </div>
                <div class="status">
                    ${status}
                </div> <hr>
                <i class="fas fa-location-arrow"></i>
                <i class="fas fa-phone-alt" style="margin-top: 20px;"></i>
                <div class=address>
                <a href=${link}>
                    ${address}
                </a>
                <br>${number}
                </div>`
    
    var marker = new google.maps.Marker({
      map: map,
      position: latlng,
      icon: icons,
      animation: google.maps.Animation.DROP,
    });
    google.maps.event.addListener(marker, 'click', function() {
      infoWindow.setContent(html);
      infoWindow.open(map, marker);
    });
    markers.push(marker);
}
