define(['jquery', 'knockout', './router', 'bootstrap', 'knockout-projections',
        //'image!awsum.jpg',
        //'json!data/foo.json',
        //'noext!js/bar.php',
        //'mdown!data/lorem_ipsum.md',
        //'async!https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&libraries=places',
        //'goog!visualization,1,packages:[corechart,geochart]',
        //'goog!search,1',
        //'font!google,families:[Tangerine,Cantarell]',
       ], function($, ko, router) {

  // Components can be packaged as AMD modules, such as the following:
  ko.components.register('nav-bar', { require: 'components/nav-bar/nav-bar' });
  ko.components.register('home-page', { require: 'components/home-page/home' });

  // ... or for template-only components, you can just point to a .html file directly:
  ko.components.register('about-page', {
    template: { require: 'text!components/about-page/about.html' }
  });

  // [Scaffolded component registrations will be inserted here. To retain this feature, don't remove this comment.]

  // Start the application
  ko.applyBindings({ route: router.currentRoute });
});
       
