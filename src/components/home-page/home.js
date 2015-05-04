define(["knockout", "text!./home.html", "bootstrap",
        //'async!http://maps.google.com/maps/api/js?sensor=false',
        'async!https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&libraries=places',
        'goog!search,1',
        //'goog!visualization,1,packages:[corechart,geochart]',
        //'goog!search,1',
    ],

    function(ko, homeTemplate) {

        var Neighborhood = function(name, lat, lon) {
            this.name = name;
            this.lat = lat;
            this.lon = lon;
        };

        function HomeViewModel(route) {
            var self = this;

            self.myNeighborhood = ko.observable(new Neighborhood("Avondale Estates, GA", 33.776, -84.2750));
            self.places = ko.observableArray([]);
            self.restaurants = ko.observableArray([]);
            self.showRestaurants = ko.observable(true);
            self.showRestaurants.subscribe(function(updated){
                self.setMarkers();
            });
            self.shopping = ko.observableArray();
            self.markers = ko.observableArray();
            console.log("my lat " + self.myNeighborhood().lat + " my lon " + self.myNeighborhood().lon);
            this.message = ko.observable('Welcome to avondale-map!');
        }


        HomeViewModel.prototype.setMarkers = function(){
            var self = this;

            console.log("setMarkers");
            console.log("user has added " + this.places().length + "  places");
            var allPlaces = this.places();
            if (this.showRestaurants() === true){
                console.log("display the restaurants");
                allPlaces = allPlaces.concat(this.restaurants());
            }

            console.log("Make markers for  " + allPlaces.length + " places");
            if (this.markers().length > 0){
                console.log("removing all the markers");
                for (var i = 0; i < this.markers().length; i++) {
                    console.log("removing marker " + i);
                    this.markers.replace(i, this.markers()[i].setMap(null))
                }
            }
            
            // For each place, get the icon, place name, and location.
            this.markers([]);
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0, place; place = allPlaces[i]; i++) {
                (function(place) {
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
                        position: place.geometry.location
                    });
                    
                    marker.placeListIndex = i;

                    google.maps.event.addListener(marker, 'click', function(e) {
                        console.log("clicked " + marker.title);
                        
                        //close all open panels so we can scroll to the right spot
                        $("#accordion .in").collapse('hide');
                        $("#placeAccordion .in").collapse('hide');
                        
                        //scroll the list down to the one we will click on
                        var placeCount = allPlaces.length;
                        var totalHeight = $(".place-list").get(0).scrollHeight;
                        var newPosition = (totalHeight/placeCount) * marker.placeListIndex - $("#place_" + place.place_id).outerHeight();
                        console.log("count: " + placeCount + "  height: " + totalHeight + "  position: " + newPosition);
                        $(".place-list").scrollTop(newPosition);


                        //fire a click event on the right panel
                        $("a[href=#place_" + place.place_id + "]").click()

                        
                    });

                
                    console.log("created map marker for " + marker.title);
                    
                    self.markers.push(marker);
                
                    bounds.extend(place.geometry.location);
                })(place);
            }
            
            //this.myNeighborhood().googleMap.fitBounds(bounds);
        };
        
	
        
        
	ko.bindingHandlers.map = {
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
                        bindingContext.$data.setMarkers();
                    }
                    else {
                        console.log("Got bad places service status!");
                        console.log(status);
                    }
                });
                                
	    }
	};            
        


	ko.bindingHandlers.addressAutocomplete = {
	    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                console.log("ko.bindingHandlers.addressAutocomplete");
		var value = valueAccessor();
                var valueUnwrapped = ko.unwrap(value);
		
		var options = { types: ['geocode', 'establishment'] };
		ko.utils.extend(options, allBindingsAccessor().autocompleteOptions)
		
		var autocomplete = new google.maps.places.Autocomplete(element, options);
                
		google.maps.event.addListener(autocomplete, 'place_changed', function () {
                    var newPlace = autocomplete.getPlace();
                    console.log("got a new place");
		    value.push(newPlace);
                    bindingContext.$data.setMarkers();
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
