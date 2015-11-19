"use strict";
var appConfig = {};

appConfig.servicesUrl = 'localhost://';
appConfig.loggingEnabled = true;
appConfig.version = "2.2.2";

//angular.module('ui.bootstrap.dropdownToggle', []).directive('dropdownToggle', ['$document', '$location', function ($document, $location) { var openElement = null, closeMenu   = angular.noop; return { restrict: 'CA', link: function(scope, element, attrs) { scope.$watch('$location.path', function() { closeMenu(); }); element.parent().bind('click', function() { closeMenu(); }); element.bind('click', function (event) { var elementWasOpen = (element === openElement); event.preventDefault(); event.stopPropagation(); if (!!openElement) { closeMenu(); } if (!elementWasOpen) { element.parent().addClass('open'); openElement = element; closeMenu = function (event) { if (event) { event.preventDefault(); event.stopPropagation(); } $document.unbind('click', closeMenu); element.parent().removeClass('open'); closeMenu = angular.noop; openElement = null; }; $document.bind('click', closeMenu); } }); } }; }]);
angular.module('myApp.controllers', []);
angular.module('myApp.services', []);
angular.module('myApp', ['ionic','ui.bootstrap','myApp.services', 'myApp.controllers'])

    .config(function($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider
            // 找客户
            .state('customer', {
                url: '/customer',
                templateUrl: 'views/customer/index.html',
                controller: 'CustomerController'
            })
            .state('customer-result', {
                url: '/customer/result',
                templateUrl: 'views/customer/customers.html',
                controller: 'ResultController'
            })
            .state('customer-filter', {
                url: '/customer/filter',
                templateUrl: 'views/customer/filter.html',
                controller: 'CustomerController'
            })


        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/customer');

    });
