/*
 * Copyright (C) 2015 Stratio (http://stratio.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  angular
    .module('webApp')
    .service('ModelService', ModelService);

  ModelService.$inject = ['ModalService', 'PolicyModelFactory', '$translate', 'ModelFactory', 'CubeService', 'UtilsService', '$q'];

  function ModelService(ModalService, PolicyModelFactory, $translate, ModelFactory, CubeService, UtilsService, $q) {
    var vm = this;

    var showModelCreationPanel = null;

    vm.showConfirmRemoveModel = showConfirmRemoveModel;
    vm.addModel = addModel;
    vm.removeModel = removeModel;
    vm.isLastModel = isLastModel;
    vm.isNewModel = isNewModel;
    vm.changeModelCreationPanelVisibility = changeModelCreationPanelVisibility;
    vm.isActiveModelCreationPanel = isActiveModelCreationPanel;
    vm.activateModelCreationPanel = activateModelCreationPanel;
    vm.disableModelCreationPanel = disableModelCreationPanel;

    init();

    function init() {
      vm.policy = PolicyModelFactory.getCurrentPolicy();
      showModelCreationPanel = true;
    }


    function activateModelCreationPanel() {
      showModelCreationPanel = true;
    }

    function disableModelCreationPanel() {
      showModelCreationPanel = false;
    }

    function showConfirmRemoveModel(cubeNames) {
      var defer = $q.defer();
      var templateUrl = "templates/modal/confirm-modal.tpl.html";
      var controller = "ConfirmModalCtrl";
      var message = "";
      var extraClass = "";
      var size = "lg";

      if (cubeNames && cubeNames.length > 0) {
        message = $translate.instant('_REMOVE_MODEL_MESSAGE_', {modelList: cubeNames.toString()});
      }
      var resolve = {
        title: function () {
          return "_REMOVE_MODEL_CONFIRM_TITLE_"
        },
        message: function () {
          return message;
        }
      };
      var modalInstance = ModalService.openModal(controller, templateUrl, resolve, extraClass, size);

      modalInstance.result.then(function () { //TODO Refactor
        defer.resolve();
      }, function () {
        defer.reject();
      });
      return defer.promise;
    }

    function addModel() {
      vm.error = "";
      var modelToAdd = angular.copy(ModelFactory.getModel());
      if (ModelFactory.isValidModel()) {
        vm.policy.transformations.push(modelToAdd);
        PolicyModelFactory.enableNextStep();
      }
    }

    function removeModel() {
      var defer = $q.defer();
      var modelPosition = ModelFactory.getContext().position;
      //check if there are cubes whose dimensions have model outputFields as fields
      var cubeList = CubeService.findCubesUsingOutputs(vm.policy.transformations[modelPosition].outputFields);

      showConfirmRemoveModel(cubeList.names).then(function () {
        vm.policy.cubes = UtilsService.removeItemsFromArray(vm.policy.cubes, cubeList.positions);
        vm.policy.transformations.splice(modelPosition, 1);
        if (vm.policy.transformations.length == 0) {
          PolicyModelFactory.disableNextStep();
        }
        defer.resolve();
      }, function () {
        defer.reject()
      });
      return defer.promise;
    }

    function isLastModel(index) {
      return index == vm.policy.transformations.length - 1;
    }

    function isNewModel(index) {
      return index == vm.policy.transformations.length;
    }

    function changeModelCreationPanelVisibility(isVisible) {
      showModelCreationPanel = isVisible;
    }

    function isActiveModelCreationPanel() {
      return showModelCreationPanel;
    }
  }
})();
