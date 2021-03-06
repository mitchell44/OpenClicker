(function () {
  'use strict';
  
  angular
    .module('openClicker')
    .factory('QuestionService', QuestionService);
  
  QuestionService.$inject = [];
  
  function QuestionService() {
    var service = {
      createQuestion: createQuestion,
      updateQuestionStartTime: updateQuestionStartTime,
      updateQuestionEndTime: updateQuestionEndTime,
      deleteQuestion: deleteQuestion,
      editQuestion: editQuestion
    }
    
    return service;
    
    function createQuestion(quizId, groupId, question, answers, correctAnswer, success, failure) {
      Meteor.call('createQuestion', quizId, groupId, question, answers, correctAnswer, function (error, result)  {
        if (error)
        {
          console.log(error.message);
          if (failure && typeof(failure) == 'function')
          {
            failure();
          }
        }
        else if (result)
        {
          if (success && typeof(success) == 'function')
          {
            success();
          }
        }
        else
        {
          if (failure && typeof(failure) == 'function')
          {
            failure();
          }
        }
      });
    }
    
    function updateQuestionStartTime(questionId, startTime) {
      Meteor.call('updateQuestionStartTime', questionId, startTime, function (error, result) {
        if (error)
        {
          console.log(error.message);
        }
      });
    }
    
    function updateQuestionEndTime(questionId, endTime) {
      Meteor.call('updateQuestionEndTime', questionId, endTime, function (error, result) {
        if (error)
        {
          console.log(error.message);
        }
      });
    }
    
    function deleteQuestion(questionId) {
      Meteor.call('deleteQuestion', questionId, function (error, result) {
        if (error)
        {
          console.log(error.message);
        }
      });
    }

    function editQuestion(questionId, groupId, questionAsked, possibleAnswers, answer, success, failure) {
      Meteor.call('editQuestion', questionId, groupId, questionAsked, possibleAnswers, answer, function (error, result) {
        if (error)
        {
          console.log(error.message);
          if (failure && typeof(failure) == 'function')
          {
            failure();
          }
        }
        else if (result)
        {
          if (success && typeof(success) == 'function')
          {
            success();
          }
        }
        else
        {
          if (failure && typeof(failure) == 'function')
          {
            failure();
          }
        }
      });
    }
  }

})();