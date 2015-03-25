// require.js looks for the following global when initializing
var require = {
    baseUrl: ".",
    paths: {
        "bootstrap":            "bower_modules/components-bootstrap/js/bootstrap.min",
        "crossroads":           "bower_modules/crossroads/dist/crossroads.min",
        "hasher":               "bower_modules/hasher/dist/js/hasher.min",
        "jquery":               "bower_modules/jquery/dist/jquery",
        "knockout":             "bower_modules/knockout/dist/knockout",
        "knockout-projections": "bower_modules/knockout-projections/dist/knockout-projections",
        "signals":              "bower_modules/js-signals/dist/signals.min",
        "text":                 "bower_modules/requirejs-text/text",

        //create alias to plugins (not needed if plugins are on the baseUrl)
        "async":                "bower_modules/requirejs-plugins/src/async",
        "font":                 "bower_modules/requirejs-plugins/src/font",
        "goog":                 "bower_modules/requirejs-plugins/src/goog",
        "image":                "bower_modules/requirejs-plugins/src/image",
        "json":                 "bower_modules/requirejs-plugins/src/json",
        "noext":                "bower_modules/requirejs-plugins/src/noext",
        "mdown":                "bower_modules/requirejs-plugins/src/mdown",
        "propertyParser":       "bower_modules/requirejs-plugins/src/propertyParser",
        "markdownConverter":    "bower_modules/requirejs-plugins/lib/Markdown.Converter"
    },
    shim: {
        "bootstrap": { deps: ["jquery"] }
    }
};
