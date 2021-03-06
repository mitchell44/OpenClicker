(function () {
  'use-strict';
  
  angular.module('openClicker').config(function ($urlRouterProvider, $stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    
    // Define states
    $stateProvider
      .state('activeQuestions', {
        url: '/active-questions/:groupId',
        views: {
          header: {
            templateUrl: 'client/templates/header.html'
          },
          main: {
            templateUrl: 'client/templates/routes/activeQuestions.html'
          }    
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified)
            {
              return {
                to: 'home',
                params: {}
              }
            }
          }
        }
      })
      .state('answerQuestion', {
        url: '/answer-question/:questionId',
        views: {
          header: {
            templateUrl: 'client/templates/header.html'
          },
          main: {
            templateUrl: 'client/templates/routes/answerQuestion.html'
          }    
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified)
            {
              return {
                to: 'home',
                params: {}
              }
            }
          }
        }
      })
      .state('askQuestion', {
        url: '/ask-question/:questionId',
        views: {
          header: {
            templateUrl: 'client/templates/header.html'
          },
          main: {
            templateUrl: 'client/templates/routes/askQuestion.html'
          }    
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified ||
                !Roles.userIsInRole(Meteor.userId(), PROFESSOR_ROLE, Roles.GLOBAL_GROUP))
            {
              return {
                to: 'home',
                params: {}
              }
            }
          }
        }
      })
      .state('createGroup', {
        url: '/create-group',
        views: {
          header: {
            templateUrl: 'client/templates/header.html'
          },
          main: {
            templateUrl: 'client/templates/routes/createGroup.html'
          }    
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified ||
                !Roles.userIsInRole(Meteor.userId(), PROFESSOR_ROLE, Roles.GLOBAL_GROUP))
            {
              return {
                to: 'home',
                params: {}
              }
            }
          }
        }
      })
      .state('createQuestion', {
        url: '/create-question/:groupId/:quizId',
        views: {
          header: {
            templateUrl: 'client/templates/header.html'
          },
          main: {
            templateUrl: 'client/templates/routes/createQuestion.html'
          }    
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified ||
                !Roles.userIsInRole(Meteor.userId(), PROFESSOR_ROLE, Roles.GLOBAL_GROUP))
            {
              return {
                to: 'home',
                params: {}
              }
            }
          }
        }
      })
      .state('createQuiz', {
        url: '/create-quiz/:groupId',
        views: {
          header: {
            templateUrl: 'client/templates/header.html'
          },
          main: {
            templateUrl: 'client/templates/routes/createQuiz.html'
          }    
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified ||
                !Roles.userIsInRole(Meteor.userId(), PROFESSOR_ROLE, Roles.GLOBAL_GROUP))
            {
              return {
                to: 'home',
                params: {}
              }
            }
          }
        }
      })
      .state('ownedQuizzes', {
        url: '/owned-quizzes/:groupId',
        views: {
          header: {
            templateUrl: 'client/templates/header.html'
          },
          main: {
            templateUrl: 'client/templates/routes/ownedQuizzes.html'
          }    
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified ||
                !Roles.userIsInRole(Meteor.userId(), PROFESSOR_ROLE, Roles.GLOBAL_GROUP))
            {
              return {
                to: 'home',
                params: {}
              }
            }
          }
        }
      })
      .state('editQuestion', {
        url: '/edit-question/:questionId',
        views: {
          header: {
            templateUrl: 'client/templates/header.html'
          },
          main: {
            templateUrl: 'client/templates/routes/editQuestion.html'
          }    
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified ||
                !Roles.userIsInRole(Meteor.userId(), PROFESSOR_ROLE, Roles.GLOBAL_GROUP))
            {
              return {
                to: 'home',
                params: {}
              }
            }
          }
        }
      })
      .state('ownedQuestions', {
        url: '/owned-questions/:groupId/:quizId',
        views: {
          header: {
            templateUrl: 'client/templates/header.html'
          },
          main: {
            templateUrl: 'client/templates/routes/ownedQuestions.html'
          }    
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified ||
                !Roles.userIsInRole(Meteor.userId(), PROFESSOR_ROLE, Roles.GLOBAL_GROUP))
            {
              return {
                to: 'home',
                params: {}
              }
            }
          }
        }
      })
      .state('editRoles', {
        url: '/edit-roles/:userId',
        views: {
          header: {
            templateUrl: 'client/templates/header.html'
          },
          main: {
            templateUrl: 'client/templates/routes/editRoles.html'
          }    
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified ||
                !Roles.userIsInRole(Meteor.userId(), ADMIN_ROLE, Roles.GLOBAL_GROUP))
            {
              return {
                to: 'home',
                params: {}
              }
            }
          }
        }
      })
      .state('home', {
        url: '/',
        views: {
          header: {
            templateUrl: 'client/templates/header2.html'
          },
          main: {
            templateUrl: 'client/templates/routes/home.html'
          }    
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified)
            {
              return {
                to: 'welcome',
                params: {}
              }
            }
          }
        }
      })
      .state('updateUser', {
        url: '/update-user',
        views: {
            header: { templateUrl: "client/templates/header.html" },
            main: { templateUrl: "client/templates/routes/updateUser.html" },
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified)
            {
              return {
                to: 'home',
                params: {}
              }
            }
          }
        }
      })
      .state('welcome', {
        url: '/welcome',
        views: {
          header: {
            templateUrl: 'client/templates/header.html'
          },
          main: {
            templateUrl: 'client/templates/routes/welcome.html'
          }    
        }
      })
      .state('updateGroup', {
        url: '/update-group/:groupId',
        views: {
          header: {
            templateUrl: 'client/templates/header.html'
          },
          main: {
            templateUrl: 'client/templates/routes/updateGroup.html'
          }    
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified ||
                !Roles.userIsInRole(Meteor.userId(), PROFESSOR_ROLE, Roles.GLOBAL_GROUP))
            {
              return {
                to: 'home',
                params: {}
              }
            }
          }
        }
      })
      .state('groupSummary', {
        url: '/group-summary/:groupId',
        views: {
          header: {
            templateUrl: 'client/templates/header.html'
          },
          main: {
            templateUrl: 'client/templates/routes/groupSummary.html'
          }    
        },
        data: {
          rule: function () {
            if (!Meteor.userId() ||
                !Meteor.user().emails[0].verified ||
                !Roles.userIsInRole(Meteor.userId(), PROFESSOR_ROLE, Roles.GLOBAL_GROUP))
            {
              return {
                to: 'home',
                params: {}
              }
            }
          }
        }
      });
      
    // Set default route for unknown urls
    $urlRouterProvider.otherwise('/');
  });
  
  // modified from ui-router FAQ
  // (https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-create-rules-to-prevent-access-to-a-state)
  angular.module('openClicker').run(function($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function(e, to) {
      if (to.data)
      {
        if (!angular.isFunction(to.data.rule))
        {
          return;
        }
        else
        {
          var result = to.data.rule();

          if (result && result.to) {
            e.preventDefault();
            // Optionally set option.notify to false if you don't want 
            // to retrigger another $stateChangeStart event
            // Note:  templates seem to not always load properly if
            // option.notify is false
            $state.go(result.to, result.params, {notify: true});
          }
        }
      }
    });
  });
})();