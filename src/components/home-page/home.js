require.config({catchError:true});
requirejs.onError = function (err) {
    var failedId = err.requireModules && err.requireModules[0];
    console.log("Got failedId: " + failedId + "  requireType: " + err.requireType);
    if (err.requireType === 'timeout') {
        console.log('modules: ' + err.requireModules); 
    }
    //report the error on the webpage
    $("#page").text("LOADING REQUIRED MODULES FAILED: " + err.requireType + ":   "+ failedId)
    
    throw err;
};
define(["knockout", "text!./home.html", "bootstrap",
        //'async!http://maps.google.com/maps/api/js?sensor=false',
        'async!https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&libraries=places',
        'goog!search,1',
        //'goog!visualization,1,packages:[corechart,geochart]',
        //'goog!search,1',
       ],

       function(ko, homeTemplate) {
           console.log("in main home.js function");
           var Neighborhood = function(name, lat, lon) {
               this.name = name;
               this.lat = lat;
               this.lon = lon;
               this.googleMap = null;
           };
           
           function HomeViewModel(route) {
               var self = this;
               self.myNeighborhood = ko.observable(new Neighborhood("Avondale Estates, GA", 33.776, -84.2750));
               self.places = ko.observableArray([]);
               self.restaurants = ko.observableArray([]);
               self.showRestaurants = ko.observable(true);
               self.showRestaurants.subscribe(function(updated){
                   //TODO: FIX THIS!!
                   var map = null;
                   if (updated === true){
                       console.log("show the restaurants")
                       map = self.myNeighborhood().googleMap;
                   }

                   for (var i in self.restaurants()) {
                       self.restaurants()[i].mapMarker.setMap(map);
                   }
               });
               self.allPlaces = ko.computed(function() {
                   //this is all the restaurants AND all the user-added places
                   var everywhere = self.restaurants().concat(self.places());
                   return everywhere;
               }, this);
           
               // observables related to map markers and info windows
               self.markers = ko.observableArray();
               self.photoURL = ko.observable("");
               self.photoTitle = ko.observable("no image found");
               self.markerTitle = ko.observable("Unknown Name");
               self.markerAddress = ko.observable("Unknown Address");

               console.log("my lat " + self.myNeighborhood().lat + " my lon " + self.myNeighborhood().lon);
               this.message = ko.observable('Welcome to avondale-map!');
               

               self.clickMapMarker = function(place, e) {
                   //Toggle the info window on a map marker
                   console.log("expanded list accordion for " + place.name);
                   console.log(self);
                   console.log(e);
                   self.showInfoWindow(place.mapMarker);
               };
           

               self.getMarkerContent = function(title, lat, lon, address) {
                   var self = this;
                   //Get picture from flickr
                   console.log("getMarkerContent: title: " + title);
                   var apiKey = "f42f795745b12915318c5e66e664db8e";
                   var flickrAPI = "http://api.flickr.com/services/rest/?method=flickr.photos.search&jsoncallback=?";
                   $.getJSON( flickrAPI, {
                       text: title,
                       api_key: apiKey,
                       tagmode: "any",
                       format: "json",
                       //has_geo: true,
                       lat: lat,
                       lon: lon,
                       radius: 10,
                       per_page: 1,
                   })
                       .done(function( data ) {
                           console.log("data from flickr! Num Photos: " + data.photos.photo.length);
                           if (data.photos.photo.length >= 1){
                               //just display the first photo
                               var photo = data.photos.photo[0];
                               self.photoURL("http://farm" + photo.farm + ".static.flickr.com/" + 
                                             photo.server + "/" + photo.id + "_" + photo.secret + "_" + "t.jpg");
                               self.photoTitle(photo.title);
                               var otherURL = "http://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
                           }
                           else {
                               self.photoURL("");
                               self.photoTitle("No image found");
                           }
                       })
                       .fail(function(err) {
                           console.log("error from flickr");
                           console.log(err);
                           self.photoURL("");
                           self.photoTitle("Image load error");
                       })
                       .always(function() {
                           self.markerTitle(title);
                           self.markerAddress(address);
                       });
               };

           
               self.showInfoWindow = function(marker) {
                   var self = this;
                   
                   // Set all the markers to their unselected icon
                   for (var i=0; i< self.markers().length; i++){
                       if (self.markers()[i].savedIcon){
                           self.markers()[i].setIcon(self.markers()[i].savedIcon);
                       }
                   }
                   
                   // Change icon so they know what is selected
                   marker.savedIcon = marker.icon;
                   marker.setIcon("http://maps.google.com/mapfiles/ms/micons/POI.png");
                   
                   // Close any info windows that were open
                   for (var i=0; i< self.markers().length; i++){
                       self.markers()[i].info.close();
                   }
                   
                   var place = self.allPlaces()[marker.placeListIndex];
                   console.log("placeListIndex: " + marker.placeListIndex + "  allPlaces.length: " + self.allPlaces().length);
                   // Get photo for the info window
                   self.getMarkerContent(place.name, self.myNeighborhood().lat, self.myNeighborhood().lon, place.formatted_address);
                   
                   // Open the info window
                   marker.info.open(self.myNeighborhood().googleMap, marker);
               };
               
               var addInfoWindow = function(marker, map, content) {
                   var infowindow = new google.maps.InfoWindow({
                       content: content,
                       size: new google.maps.Size(50, 50)
                   });
                   
                   marker.info = infowindow;
               };
           
               self.createMapMarker = function(place, placeListIndex){
                   //Add a new map marker to the map
                   var image = {
                       url: place.icon,
                       size: new google.maps.Size(71, 71),
                       origin: new google.maps.Point(0, 0),
                       anchor: new google.maps.Point(17, 34),
                       scaledSize: new google.maps.Size(25, 25)
                   };
                   
                   // Create a marker for each place.
                   var marker = new google.maps.Marker({
                       map: self.myNeighborhood().googleMap,
                       icon: image,
                       title: place.name,
                       snippet: "stuff",
                       position: place.geometry.location,
                   });
                   
                   var content = $('#mapMarkerInfo')[0];
                   addInfoWindow(marker, self.myNeighborhood().googleMap, content);
                   
                   marker.placeListIndex = placeListIndex;
                   
                   google.maps.event.addListener(marker, 'click', function(e) {
                       console.log("clicked " + marker.title);
                       
                       self.showInfoWindow(marker);
                       
                       //close all open panels so we can scroll to the right spot on our list
                       $("#accordion .in").collapse('hide');
                       $("#placeAccordion .in").collapse('hide');
                       
                       //scroll the list down to the one we will click on
                       var placeCount = self.allPlaces().length;
                       var totalHeight = $(".place-list").get(0).scrollHeight;
                       var newPosition = (totalHeight/placeCount) * marker.placeListIndex - $("#place_" + place.place_id).outerHeight();
                       console.log("count: " + placeCount + "  height: " + totalHeight + "  position: " + newPosition);
                       $(".place-list").scrollTop(newPosition);               
                       
                       //fire a click event on our list to open the right accordion
                       $("a[href=#place_" + place.place_id + "]").click()
                       
                   });
                   
                   google.maps.event.addListener(marker.info, "closeclick", function () {
                       //google maps will destroy this node and knockout will stop updating it
                       //add it back to the body so knockout will take care of it
                       $('#hiddenStuff').append($('#mapMarkerInfo'));
                       
                       //put back the old icon since this is no longer selected
                       marker.setIcon(marker.savedIcon);
                   });
                   
                   console.log("created map marker for " + marker.title);
                   
                   self.markers.push(marker);
                   place.mapMarker = marker;
               };
               
               
               self.setMarkers = function(){
                   //sets all the initial markers.  For now, this is just restaurants.
                   
                   console.log("Make markers for  " + self.allPlaces().length + " places");
                   if (this.markers().length > 0){
                       //Remove any markers we had set previously. Really, there shouldn't be any.
                       console.log("removing all the markers");
                       for (var i = 0; i < this.markers().length; i++) {
                           console.log("removing marker " + i);
                           this.markers.replace(i, this.markers()[i].setMap(null))
                       }
                   }
                   
                   // For each place, get the icon, place name, and location.
                   this.markers([]);
                   var bounds = new google.maps.LatLngBounds();
                   for (var i = 0, place; place = self.allPlaces()[i]; i++) {
                       (function(place) {
                           self.createMapMarker(place, i);
                           bounds.extend(place.geometry.location);
                       })(place);
                   }
                   
                   //this will zoom us out to fit all the markers
                   this.myNeighborhood().googleMap.fitBounds(bounds);
               };	
           }//end HomeViewModel
           
	   ko.bindingHandlers.map = {
               // Custom knockout binding for a google map
	       //http://stackoverflow.com/questions/12722925/google-maps-and-knockoutjs

	       init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                   console.log("ko.bindingHandlers.init");
		   var mapObj = ko.utils.unwrapObservable(valueAccessor());
		   var latLng = new google.maps.LatLng(
		       ko.utils.unwrapObservable(mapObj.lat),
		       ko.utils.unwrapObservable(mapObj.lon));
		   var mapOptions = {
		       center: latLng,
		       zoom: 15,
		       mapTypeId: google.maps.MapTypeId.ROADMAP
		   };
                   
		   mapObj.googleMap = new google.maps.Map(element, mapOptions);          
                   
                   //Set our place search and place list as 
                   //google controls and attach them to the map
                   var controlElement = $("#map-place-control")
                   mapObj.googleMap.controls[google.maps.ControlPosition.LEFT_TOP].push(controlElement[0]);      
                   
                var request = {
                    location: latLng,
                    radius: '1',
                    query: 'restaurants'
                };
                
                   console.log("Let's look up some restaurants");
                   
                   var service = new google.maps.places.PlacesService(mapObj.googleMap);
                   service.textSearch(request, function(results, status) {
                       if (status == google.maps.places.PlacesServiceStatus.OK) {
                           console.log("places loaded with this many results: " + results.length);
                           for (var i = 0; i < results.length; i++) {
                               var place = results[i];
                               bindingContext.$data.restaurants.push(place);
                           }
                           //populate the known place markers
                           //bindingContext.$data.setMarkers();
                           viewModel.setMarkers();
                       }
                    else {
                        console.log("Got bad places service status!");
                        console.log(status);
                    }
                   });
                   
	       }
	   };            

           
	   ko.bindingHandlers.addressAutocomplete = {
               //Custom knockout binding for a good places autocomplete input form
	       init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                   console.log("ko.bindingHandlers.addressAutocomplete");
		   var value = valueAccessor();
                   var valueUnwrapped = ko.unwrap(value);
		   
		   var options = { types: ['geocode', 'establishment'] };
		   ko.utils.extend(options, allBindingsAccessor().autocompleteOptions)
		   
		   var autocomplete = new google.maps.places.Autocomplete(element, options);
                   
		   google.maps.event.addListener(autocomplete, 'place_changed', function () {
                       var newPlace = autocomplete.getPlace();
                       if (newPlace.place_id) { 
                           console.log("got a new place");
                           newPlace.clickMapMarker = self.clickMapMarker;
		           value.push(newPlace);
                           bindingContext.$data.createMapMarker(newPlace, viewModel.allPlaces().length - 1);
                       
                           //scroll to bottom of list where this will be added
                           $(".place-list").scrollTop($(".place-list").get(0).scrollHeight);            
                       }
		   });
                   
		   // Bias the SearchBox results towards places that are within the bounds of the
		   // current map's viewport.
		   google.maps.event.addListener(bindingContext.$data.myNeighborhood().googleMap, 'bounds_changed', function() {
		       var bounds = bindingContext.$data.myNeighborhood().googleMap.getBounds();
		       autocomplete.setBounds(bounds);
		   });      
                   
	       },
	       update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		   console.log("search box changed");
		   ko.bindingHandlers.value.update(element, valueAccessor);
	       }
	   };
           
           
           return {
               viewModel: HomeViewModel,
               template: homeTemplate
           };
           
       });
