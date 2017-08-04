angular.module('dnsim').component('electronNav', {
  templateUrl: './electron-nav.html',
  controller: [
  '$location','translations','region','itemCategory','saveHelper',
  function($location,translations,region,itemCategory,saveHelper) {
    var ctrl = this;
    
    try {
      var noLocationMenu = [];
      var normalMenu = [
        {path: '/builds', name:'builds', icon: 'menu-hamburger'},
        {path: '/search', name:'search', icon: 'search'},
        ];
      
      var buildAction = {path: 'build', name:'build'};
      
      var withBuildMenu = [
        {path: '/builds', name:'builds', icon: 'menu-hamburger'},
        {path: '/search', name:'search', icon: 'search'},
        buildAction,
        ];
        
      region.init();
    
      ctrl.isSearch = function() {
        return $location.path().indexOf('/search') == 0;
      }
  
      ctrl.isLoading = function() {
        return translations.startedLoading && 
              !translations.isLoaded() &&
              region.tlocation != null &&
              region.tlocation.url != '' &&
              !ctrl.noRegion();
      }
      
      ctrl.noRegion = function() {
        return region.dntLocation == null;
      }
        
      ctrl.getActions = function() {
        try {
          var menu = null;
          
          var currentBuild = saveHelper.getCurrentBuild();
          if(currentBuild) {
            if(!ctrl.savedItems || !(currentBuild in ctrl.savedItems)) {
              // console.log('loading saved items');
              ctrl.savedItems = saveHelper.getSavedItems();
            }
            
            if(!(currentBuild in ctrl.savedItems)) {
              currentBuild = null;
            }
          }
    
          if(region.dntLocation != null && region.dntLocation.url == '') {
            menu = noLocationMenu; 
          }
          else if(region.tlocation != null && region.tlocation.url == '') {
            menu = noLocationMenu; 
          }
          else if(currentBuild && currentBuild != 'null') {
            menu = withBuildMenu;
            buildAction.path = 'build?buildName=' + currentBuild;
            buildAction.name = currentBuild;
            if(currentBuild in ctrl.savedItems) {
              buildAction.build = ctrl.savedItems[currentBuild];
            }
          }
          else if($location.path() == '/view-group' || region.dntLocation == null) {
            menu = normalMenu;
          }
          else {
            menu = normalMenu;
          }
          
          var path = $location.path;
          angular.forEach(menu, function(value, key) {
            delete value.extraCss;
            if(path && path.length == 1) {
              if(value.path.length == 1) {
                value.extraCss = 'active';
              }
            }
            else if(value.path && value.path.length > 1 && path.indexOf('/' + value.path) == 0) {
              if(value.path != 'builds' || path == '/builds') {
                value.extraCss = 'active';
              }
            }
          });
          
          return menu;
        }
        catch(ex) {
          ctrl.simError = ex.message;
          console.error(ex);
        }
      };
    }
    catch(ex) {
      ctrl.simError = ex.message;
      console.error(ex);
    }
  }]
});