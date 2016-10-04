angular.module('sample').component('entityTable', {
  templateUrl: 'entity-table.html',
  controller: function($scope, $location, $timeout, Api) {
    $scope.schema = $.extend(true, {}, $scope.$ctrl.schema);
    $scope.schema.fields = [];

    $scope.$ctrl.fields.forEach(function(fieldId){
      $scope.schema.fields.push(
        $scope.$ctrl.schema.fields.find(function(field){
          return field.id == fieldId;
        })
      );
    });

    $scope.editAction = function() {
      var selectedId = $('input[name=radio]:checked').val();
      if ($scope.$ctrl.defaultEditAction === true)
        $location.path($scope.schema.source + '/' + selectedId);
      $scope.$ctrl.onEditAction(selectedId);
    };

    $scope.pageChangeAction = function(page){
        $scope.pagination.page = page;
        $scope.refreshAction();
    };

    $scope.refreshAction = function() {
      if ($scope.$ctrl.entityList === undefined) {
        $('.entity-table-segment').dimmer('show');
        $scope.entities = [];
        if ($scope.pagination !== undefined && $scope.pagination.page !== undefined) {
            if ($scope.$ctrl.apiExtraParams === undefined)
                $scope.$ctrl.apiExtraParams = {};
            $.extend($scope.$ctrl.apiExtraParams, {page: $scope.pagination.page});
        }
        Api.entity($scope.$ctrl.schema, 
                   $scope.$ctrl.apiExtraParams === undefined ? undefined : Object.keys($scope.$ctrl.apiExtraParams))
        .get(
          $scope.$ctrl.apiExtraParams === undefined ? {} : $scope.$ctrl.apiExtraParams, 
          function(resp){
            $scope.entities = resp[$scope.schema.apiRoot];
            if ($scope.$ctrl.jsonPagination) {
                $scope.pagination = resp['pagination'];
                var pagesTotal = Math.ceil($scope.pagination.total / $scope.pagination['per-page']);
                $scope.pagesArr = [];
                for (var i = 0; i < pagesTotal; ++i)
                {
                    $scope.pagesArr.push(i+1);
                }
            }
            $timeout(function(){
                $('.checkbox').checkbox();
                $('input[name=radio]:first').prop('checked', true);
            });
            $('.entity-table-segment').dimmer('hide');
          }
        );
      } else {
        $scope.$ctrl.onRefreshAction();
        $scope.entities = $scope.$ctrl.entityList;
        $timeout(function(){
          $('.checkbox').checkbox();
        });
      }
    };

    $scope.deleteAction = function() {
      var selectedId = $('input[name=radio]:checked').val();
      if ($scope.$ctrl.onConfirmDeleteAction !== undefined)
        if (!$scope.$ctrl.onConfirmDeleteAction({id: selectedId}))
            return;
      Api.entity($scope.$ctrl.schema).delete({id: selectedId}, function(){
        $scope.refreshAction();
      });
    };

    $scope.newAction = function() {
      $location.path($scope.$ctrl.schema.source + '/new');
    };

    $scope.$watch('$ctrl.entityList', function(){
      $scope.refreshAction();
    });

    $scope.refreshAction();
  },
  bindings: {
    defaultEditAction: '=',
    entityList: '=',
    schema: '=',
    fields: '=',
    apiExtraParams: '=',
    jsonPagination: '=',
    onEditAction: '&',
    onRefreshAction: '&',
    onConfirmDeleteAction: '&'
  }
});
