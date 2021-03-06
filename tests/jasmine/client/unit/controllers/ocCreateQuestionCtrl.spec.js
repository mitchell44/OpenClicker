'use strict';

describe('ocCreateQuestionCtrl', function () {
  beforeEach(module('openClicker'));
  
  var controller;
  var question;
  var groupId;
  var quizId;
  var answers;
  var stringAnswers;
  var correctAnswer;
  var errorMessage;
  
  // declare dependencies
  var $controller;
  var QuestionService;
  var $state;
  var scope;
  var $reactive;

  // inject dependencies
  beforeEach(inject(function (_$controller_, _QuestionService_, _$state_, $rootScope, _$reactive_) {
    $controller = _$controller_;
    QuestionService = _QuestionService_;
    $state = _$state_;
    scope = $rootScope.$new();
    $reactive = _$reactive_;
  }));
  
  // set up
  beforeEach(function () {  
    
    controller = $controller('ocCreateQuestionCtrl', {
      $scope: scope,
      $reactive: $reactive,
      QuestionService: QuestionService
    });
    
    groupId = 'testGroup';
    quizId = 'testQuiz';
    question = "TEST QUESTION";
    answers = [{answer: "answer1"},{answer: "answer2"}];
    stringAnswers = [answers[0].answer, answers[1].answer];
    correctAnswer = 0;
    errorMessage = 'error-message';
    
    controller.groupId = groupId;
    controller.quizId = quizId;
    controller.question = question;
    controller.answers = answers;
    controller.correctAnswer = correctAnswer;
    
    // spies that won't change between tests
    spyOn($state, 'go');
    spyOn(window, 'alert');
  });
  
  // test cases  
  describe('create()', function () {    
    it('should call QuestionService.createQuestion()', function() {
      spyOn(QuestionService, 'createQuestion');
      
      controller.create();
      
      expect(QuestionService.createQuestion).toHaveBeenCalledWith(controller.quizId, controller.groupId, controller.question, stringAnswers, controller.correctAnswer, jasmine.any(Function), jasmine.any(Function));
    });
    
    it('should prompt the user to enter a correct answer if none is specified', function() {
      controller.correctAnswer = null;
      
      controller.create();
      
      expect(window.alert).toHaveBeenCalled();
    });
    
    it('should prompt the user to enter more than one possible answer if there are fewer answers given', function() {
      stringAnswers = ["answer1"];
      controller.answers = [{answer: "answer1"}];
      
      controller.create();
      
      expect(window.alert).toHaveBeenCalled();
    });
    
    it('should go to the \'ownedQuestions\' route if the question is created successfully', function () {
      spyOn(QuestionService, 'createQuestion').and.callFake(function (quizId, groupId, question, stringAnswers, correctAnswer, success, failure) {
        success();
      });
      
      controller.create();
      
      expect($state.go).toHaveBeenCalledWith('ownedQuestions', {
        quizId: controller.quizId,
        groupId: controller.groupId
      });
    });
    
    it('should alert the user if question creation fails', function () {
      spyOn(QuestionService, 'createQuestion').and.callFake(function (quizId, groupId, question, stringAnswers, correctAnswer, success, failure) {
        failure();
      });
      
      controller.create();
      
      expect(window.alert).toHaveBeenCalled();
    });  
  });
  
  describe('addNewAnswer()', function () {
    it('should push a new answer to the list of possible answers', function () {
      var count = controller.answers.length;
      
      controller.addNewAnswer();
      
      expect(controller.answers.length).toEqual(count + 1);
    });
  });
  
  describe('removeAnswer()', function () {
    it('should remove the last answer from the list', function () {
      spyOn(controller.answers, 'splice');
      var lastItem = controller.answers.length - 1;
      
      controller.removeAnswer();
      
      expect(controller.answers.splice).toHaveBeenCalledWith(lastItem);
    });
    
    it('should reset correct answer to null if the correct answer was removed', function () {
      controller.correctAnswer = controller.answers.length - 1;
      
      controller.removeAnswer();
      
      expect(controller.correctAnswer).toEqual(null);
    });
  });
});