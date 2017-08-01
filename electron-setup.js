angular.module('dnsim').component('dnsimElectronSetup', {
  templateUrl: 'electron-setup.html',
  controller: function($window, region) {
    $window.document.title = 'dngearsim | SETUP';
    this.dnLocation = 'c:\\DragonNest';

    this.workLocation = region.alternativeFiles.url;
    if(this.workLocation.indexOf('file:/') >= 0) {
      this.workLocation = this.workLocation.substr(6);
    }
  }
});