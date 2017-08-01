
angular.module('dnsim').config(['$locationProvider', dnsimElectronHtml5Mode]);
function dnsimElectronHtml5Mode ($locationProvider) {
    $locationProvider.html5Mode({
    enabled: true,
    requireBase: false,
    rewriteLinks: true}).hashPrefix('!');
}

angular.module('dnsim').run(['region', dnsimElectronSetPath]);
function dnsimElectronSetPath(region) {
    //region.setCustomUrl('file:/C:\\games\\Unpacker\\firebase_na\\public');
    var workFolder = localStorage.getItem('workFolder');
    if(!workFolder) {
        workFolder = __dirname + '\\working';
    }

    region.setCustomUrl('file:/' + workFolder);
    region.setLocation(region.alternativeFiles);
}



angular.module('dnsim').config(['$routeProvider', configureElectronRoutes]);
function configureElectronRoutes($routeProvider) {
  $routeProvider.
    when('/', {
      redirectTo: '/setup'
    }).
    when('/setup', {
      template: '<dnsim-electron-setup></dnsim-electron-setup>',
    })

}