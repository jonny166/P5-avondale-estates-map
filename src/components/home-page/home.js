define(["knockout", "text!./home.html",
        'async!http://maps.google.com/maps/api/js?sensor=false',
        //'goog!visualization,1,packages:[corechart,geochart]',
        //'goog!search,1',
       ], function(ko, homeTemplate) {

    ko.bindingHandlers.map = {
        //http://stackoverflow.com/questions/12722925/google-maps-and-knockoutjs
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var mapObj = ko.utils.unwrapObservable(valueAccessor());
            var latLng = new google.maps.LatLng(
                ko.utils.unwrapObservable(mapObj.lat),
                ko.utils.unwrapObservable(mapObj.lng));
            var mapOptions = {
                center: latLng,
                zoom: 5,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            mapObj.googleMap = new google.maps.Map(element, mapOptions);
        }
    };


    function HomeViewModel(route) {
        var self = this;
        self.myMap = ko.observable({
            lat: ko.observable(55),
            lng: ko.observable(11)
        });
        this.message = ko.observable('Welcome to avondale-map!');
        this.neighborhood = ko.observable({
            name: "Avondale Estates, GA",
            zipcode: "30002",
        });
    }

    HomeViewModel.prototype.doSomething = function() {
        this.message('You invoked doSomething() on the viewmodel.');
    };

    return {
        viewModel: HomeViewModel,
        template: homeTemplate
    };

});
