// Collection creation
// These are available to the entire application, so use them any time you need a
// reference to a collection
Users = Meteor.users;
Questions = new Mongo.Collection("questions");
Quizzes = new Mongo.Collection("quizzes");
Groups = new Mongo.Collection("groups");
Answers = new Mongo.Collection("answers");

// *****Collection Schemas*****
var Schema ={};

// User Country Schema
Schema.UserCountry = new SimpleSchema({
  name: {
    type: String
  },
  code: {
    type: String,
    regEx: /^[A-Z]{2}$/
  }
});

// User Profile Schema
Schema.UserProfile = new SimpleSchema({
  firstName: {
    type: String,
    optional: true
  },
  lastName: {
    type: String,
    optional: true
  },
  birthday: {
    type: Date,
    optional: true
  },
  gender: {
    type: String,
    allowedValues: ['Male', 'Female'],
    optional: true
  },
  organization : {
    type: String,
    optional: true
  },
  website: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  bio: {
    type: String,
    optional: true
  },
  country: {
    type: Schema.UserCountry,
    optional: true
  },
  institution: {
    type: String,
    optional: true,
    defaultValue: '',
  },
  studentId: {
    type: String,
    optional: true,
    defaultValue: '',
  },
  faculty: {
    type: String,
    optional: true,
    defaultValue: '',
  }
});

// Users Schema
Schema.Users = new SimpleSchema({
  username: {
    type: String,
    optional: true
  },
  emails: {
    type: Array,
    optional: true
  },
  "emails.$": {
    type: Object
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
    type: Boolean
  },
  createdAt: {
    type: Date
  },
  profile: {
    type: Schema.UserProfile,
    optional: true
  },
  // Make sure this services field is in your schema if you're using any of the accounts packages
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  // Add `roles` to your schema if you use the meteor-roles package.
  // Option 1: Object type
  // If you specify that type as Object, you must also specify the
  // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
  // Example:
  // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
  // You can't mix and match adding with and without a group since
  // you will fail validation in some cases.
  roles: {
    type: Object,
    blackbox: true,
    defaultValue: {
      [Roles.GLOBAL_GROUP]: [
        STUDENT_ROLE
      ]
    }
  },
  // In order to avoid an 'Exception in setInterval callback' from Meteor
  heartbeat: {
    type: Date,
    optional: true
  },
  groups: {
    type: [String],
    label: "Groups for this user",
    defaultValue: []
  }
});

// Questions Schema
Schema.Questions = new SimpleSchema({
  userId: {
    type: String,
    label: "User ID"
  },
  groupId: {
    type: String,
    label: "Group ID"
  },
  questionAsked: {
    type: String,
    label: "Question"
  },
  possibleAnswers: {
    type: [String],
    label: "Possible Answers",
    minCount: 2
  },
  answer: {
    type: Number,
    label: "Correct Answer",
    min: 0
  },
  active: {
    type: Boolean
  },
  startTime: {
    type: Number,
    label: "Question Start Time",
    optional: true
  },
  endTime: {
    type: Number,
    label: "Question End Time",
    optional: true
  },
  quizId: {
    type: String,
    label: "Quiz ID"
  }
});

//Quiz Schema
Schema.Quizzes = new SimpleSchema({
  questions: {
    type: [String],
    label: "Questions in a Quiz",
  },
  name: {
    type: String,
    label: "Quiz Name"
  },
  userId: {
    type: String,
    label: "User ID"
  },
  groupId: {
    type: String,
    label: "Group ID"
  }
});

//Group Schema
Schema.Groups = new SimpleSchema({
  userId: {
    type: String,
    label: "User Admin ID"
  },
  name: {
    type: String,
    label: "Group Name"
  }
});

// Answers Schema
Schema.Answers = new SimpleSchema({
  questionId: {
    type: String,
    label: "Question ID"
  },
  groupId: {
    type: String,
    label: "Group ID"
  },
  userId: {
    type: String,
    label: "User ID"
  },
  answer: {
    type: Number,
    label: "Answer"
  },
  timestamp: {
    type: Number,
    label: "Answer Timestamp"
  },
  correct: {
    type: Boolean
  }
});

// Attaching collections to schemas created
Users.attachSchema(Schema.Users, {replace: true});
Questions.attachSchema(Schema.Questions, {replace: true});
Quizzes.attachSchema(Schema.Quizzes, {replace: true});
Groups.attachSchema(Schema.Groups, {replace: true});
Answers.attachSchema(Schema.Answers, {replace: true});

// Define Meteor methods
// All methods start by performing checks to ensure that the user is doing something they
// are permitted to do, then doing any necessary database operations, then returning true
// on success so we can have callbacks that run depending on success or failure
Meteor.methods({
  answerQuestion: function (questionId, selectedAnswer, timestamp) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkQuestionExists(questionId);
    MethodHelpers.checkQuestionIsActive(questionId);

    // grab the relevant question to do remaining checks
    var question = Questions.findOne({
      _id: questionId
    });

    MethodHelpers.checkUserInGroup(question.groupId);
    MethodHelpers.checkAnswerInRange(questionId, selectedAnswer);
    MethodHelpers.checkAnswerInTime(questionId, timestamp);

    // insert or update the answer
    Answers.update({
      questionId: question._id,
      groupId: question.groupId,
      userId: Meteor.userId(),
    }, {
      $set: {
        answer: selectedAnswer,
        timestamp: timestamp,
        correct: selectedAnswer == question.answer
      }
    }, {
      upsert: true
    });

    return true;
  },
  createGroup: function (groupName) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkCreatorPermissions();

    Groups.insert({
      userId: Meteor.userId(),
      name: groupName
    });

    return true;
  },
  createQuestion: function (quizId, groupId, question, answers, correctAnswer) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkCreatorPermissions();
    MethodHelpers.checkGroupExists(groupId);
    MethodHelpers.checkGroupOwnership(groupId);
    MethodHelpers.checkQuizExists(quizId);

    Questions.insert({
      userId: Meteor.userId(),
      groupId: groupId,
      quizId: quizId,
      questionAsked: question,
      possibleAnswers: answers,
      answer: correctAnswer,
      active: false
    });

    return true;
  },
  createQuiz: function (quizName, groupId) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkCreatorPermissions();
    MethodHelpers.checkGroupExists(groupId);
    MethodHelpers.checkGroupOwnership(groupId);

    Quizzes.insert({
      userId: Meteor.userId(),
      name: quizName,
      groupId: groupId,
      questions: []
    });

    return true;
  },
  deleteGroup: function (groupId) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkCreatorPermissions();
    MethodHelpers.checkGroupExists(groupId);
    MethodHelpers.checkGroupOwnership(groupId);

    Groups.remove({
      _id: groupId,
      userId: Meteor.userId()
    });

    // remove all users, quizzes, questions, and answers from deleted group
    Users.update({}, {
      $pull: {
        groups: groupId
      }
    }, {
      multi: true
    });

    Quizzes.remove({
      groupId: groupId
    });

    Questions.remove({
      groupId: groupId
    });

    Answers.remove({
      groupId: groupId
    });

    return true;
  },
  deleteQuestion: function (questionId) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkCreatorPermissions();
    MethodHelpers.checkQuestionExists(questionId);
    MethodHelpers.checkQuestionOwnership(questionId);

    Questions.remove({
      _id: questionId,
      userId: Meteor.userId()
    });
    
    // remove question from the associated quiz
    Quizzes.update({}, {
      $pull: {
        questions: questionId
      }
    });

    return true;
  },
  deleteQuiz: function(quizId) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkCreatorPermissions();
    MethodHelpers.checkQuizExists(quizId);
    MethodHelpers.checkQuizOwnership(quizId);

    Quizzes.remove({
      _id: quizId
    });
    
    // remove questions associated with this quiz
    Questions.remove({
      quizId: quizId
    });
    
    return true;
  },
  editQuestion: function (questionId, groupId, questionAsked, possibleAnswers, answer) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkCreatorPermissions();
    MethodHelpers.checkQuestionExists(questionId);
    MethodHelpers.checkQuestionOwnership(questionId);

    Questions.update({
      _id: questionId,
      userId: Meteor.userId()
    }, {
      $set: {
        groupId: groupId,
        questionAsked: questionAsked,
        possibleAnswers: possibleAnswers,
        answer: answer
      }
    });

    return true;
  },
  editQuiz: function (quizId, questions, userId, name) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkCreatorPermissions();
    MethodHelpers.checkQuizExists(quizId);
    MethodHelpers.checkQuizOwnership(quizId);

    Quizzes.update({
      _id: quizId,
      userId: Meteor.userId()
    }, {
      $set: {
        userId: userId,
        questions: questions,
        name: name
      }
    });

    return true;
  },
  joinGroup: function (groupId) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkGroupExists(groupId);
    MethodHelpers.checkUserNotInGroup(groupId);

    Users.update({
      _id: Meteor.userId()
    }, {
      $push: {
        groups: groupId
      }
    });

    return true;
  },
  leaveGroup: function (groupId) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkGroupExists(groupId);
    MethodHelpers.checkUserInGroup(groupId);

    Users.update({
      _id: Meteor.userId()
    }, {
      $pull: {
        groups: groupId
      }
    });

    return true;
  },
  updateGroup: function (group) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkCreatorPermissions();
    MethodHelpers.checkGroupExists(group._id);
    MethodHelpers.checkGroupOwnership(group._id);

    Groups.update({
      _id: group._id,
      userId: Meteor.userId()
    }, {
      $set: {
        name: group.name
      }
    });

    return true;
  },
  updateQuestionStartTime: function (questionId, startTime) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkCreatorPermissions();
    MethodHelpers.checkQuestionExists(questionId);
    MethodHelpers.checkQuestionOwnership(questionId);

    Questions.update({
      _id: questionId,
      userId: Meteor.userId()
    }, {
      $set: {
        startTime: startTime,
        active: true
      }
    });

    return true;
  },
  updateQuestionEndTime: function (questionId, endTime) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkCreatorPermissions();
    MethodHelpers.checkQuestionExists(questionId);
    MethodHelpers.checkQuestionOwnership(questionId);

    Questions.update({
      _id: questionId,
      userId: Meteor.userId()
    }, {
      $set: {
        endTime: endTime
      }
    });

    if (endTime !== 0)
    {
      Questions.update({
      _id: questionId,
      userId: Meteor.userId()
      }, {
        $set: {
          active: false
        }
      });
    }
    
    return true;
  },
  updateRoles: function (userId, student, professor, admin) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkAdminPermissions();
    MethodHelpers.checkUserExists(userId);

    var newRoles = [];

    if (student)
    {
      newRoles.push(STUDENT_ROLE);
    }

    if (professor)
    {
      newRoles.push(PROFESSOR_ROLE);
    }

    if (admin)
    {
      newRoles.push(ADMIN_ROLE);
    }

    Roles.setUserRoles(userId, newRoles, Roles.GLOBAL_GROUP);

    return true;
  },
  updateUser: function(user) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();

    Users.update({
      _id: user._id,
    }, {
      $set: {
        username: user.username,
        "profile.institution": user.profile.institution,
        "profile.faculty": user.profile.faculty,
        "profile.studentId": user.profile.studentId,
      }
    });

    return true;
  },
  deleteUserFromGroup: function (userId, groupId) {
    MethodHelpers.checkUserLoggedIn();
    MethodHelpers.checkVerifiedUser();
    MethodHelpers.checkGroupExists(groupId);
    MethodHelpers.checkStudentInGroup(userId, groupId);
    MethodHelpers.checkGroupOwnership(groupId);
    
    Users.update({
      _id: userId
    }, {
      $pull: {
        groups: groupId
      }
    });
    
    return true;
  },
});

// define some functions for things we will have to check frequently
MethodHelpers = {
  checkAdminPermissions: function () {
    if (!Roles.userIsInRole(Meteor.userId(), ADMIN_ROLE, Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(ERROR_NOT_AUTHORIZED);
    }
  },
  checkAnswerInTime: function (questionId, answerTimestamp) {
    var question = Questions.findOne({ _id: questionId });

    if (!question.startTime || answerTimestamp < question.startTime || (answerTimestamp > question.endTime && question.endTime != 0))
    {
      throw new Meteor.Error(ERROR_ANSWER_OUT_OF_TIME);
    }
  },
  checkAnswerInRange: function (questionId, selectedAnswer) {
    var question = Questions.findOne({ _id: questionId });
    
    if (selectedAnswer < 0 || selectedAnswer >= question.possibleAnswers.length)
    {
      throw new Meteor.Error(ERROR_ANSWER_OUT_OF_RANGE);
    }
  },
  checkCreatorPermissions: function () {
    if (!Roles.userIsInRole(Meteor.userId(), PROFESSOR_ROLE, Roles.GLOBAL_GROUP))
    {
      throw new Meteor.Error(ERROR_NOT_AUTHORIZED);
    }
  },
  checkGroupExists: function (groupId) {
    if (!Groups.findOne({ _id: groupId }))
    {
      throw new Meteor.Error(ERROR_GROUP_DOES_NOT_EXIST);
    }
  },
  checkGroupOwnership: function (groupId) {
    var group = Groups.findOne({ _id: groupId });

    if (!(group.userId == Meteor.userId()))
    {
      throw new Meteor.Error(ERROR_NOT_AUTHORIZED);
    }
  },
  checkQuestionExists: function (questionId) {
    if (!Questions.findOne({ _id: questionId }))
    {
      throw new Meteor.Error(ERROR_QUESTION_DOES_NOT_EXIST);
    }
  },
  checkQuizExists: function (quizId) {
    if (!Quizzes.findOne({ _id: quizId }))
    {
      throw new Meteor.Error(ERROR_QUIZ_DOES_NOT_EXIST);
    }
  },
  checkQuizOwnership: function (quizId) {
    var quiz = Quizzes.findOne({ _id: quizId });

    if (!(quiz.userId == Meteor.userId()))
    {
      throw new Meteor.Error(ERROR_NOT_AUTHORIZED);
    }
  },
  checkQuestionIsActive: function (questionId) {
    var question = Questions.findOne({ _id: questionId });
    
    if (!question.active)
    {
      throw new Meteor.Error(ERROR_QUESTION_INACTIVE);
    }
  },
  checkQuestionOwnership: function (questionId)
  {
    var question = Questions.findOne({ _id: questionId });

    if (!(question.userId == Meteor.userId()))
    {
      throw new Meteor.Error(ERROR_NOT_AUTHORIZED);
    }
  },
  checkUserExists: function (userId) {
    if (!Users.findOne({ _id: userId }))
    {
      throw new Meteor.Error(ERROR_USER_DOES_NOT_EXIST);
    }
  },
  checkUserInGroup: function (groupId) {
    if (!(Meteor.user().groups) || !(Meteor.user().groups && Meteor.user().groups.indexOf(groupId) >= 0))
    {
      throw new Meteor.Error(ERROR_NOT_IN_GROUP);
    }
  },
  checkStudentInGroup: function (userId, groupId) {
    var user = Users.findOne({ _id: userId });
    
    if (!(user.groups) || !(user.groups && user.groups.indexOf(groupId) >= 0))
    {
      throw new Meteor.Error(ERROR_NOT_IN_GROUP);
    }
  },
  checkUserLoggedIn: function () {
    if (!Meteor.userId())
    {
      throw new Meteor.Error(ERROR_NOT_AUTHORIZED);
    }
  },
  checkUserNotInGroup: function (groupId) {
    if (Meteor.user().groups && Meteor.user().groups.indexOf(groupId) >= 0)
    {
      throw new Meteor.Error(ERROR_ALREADY_IN_GROUP);
    }
  },
  checkVerifiedUser: function () {
    if (!Meteor.user().emails[0].verified)
    {
      throw new Meteor.Error(ERROR_NOT_AUTHORIZED);
    }
  }
}