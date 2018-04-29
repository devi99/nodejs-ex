var Question = require('../models/question');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.index = function(req, res) {
    console.log("question_index");

};


// Display list of all questions.
exports.question_list = function(req, res, next) {
    console.log("question_list 2");
    Question.find()
    .exec(function (err, list_questions) {
      if (err) { return next(err); }
      // Successful, so render
      //res.render('question_list', { title: 'Question List', question_list:  list_questions});
      //res.send(list_questions);
      console.log(list_questions);
      return list_questions;
    });

};

// Display detail page for a specific question.
exports.question_detail = function(req, res, next) {

    async.parallel({
        question: function(callback) {

            Question.findById(req.params.id)
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.question==null) { // No results.
            var err = new Error('Question not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('question_detail', { title: 'Title', question:  results.question } );
    });

};

// Display question create form on GET.
exports.question_create_get = function(req, res, next) {
    console.log("question_create_get 2");
    res.render('question_form', { title: 'Create Question' });

    // Get all authors and genres, which we can use for adding to our question.
/*     async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
    }); */

};

// Handle question create on POST.
exports.question_create_post = [
    
    // Validate fields.
    body('question', 'question must not be empty.').isLength({ min: 1 }).trim(),
    body('correctAnswer', 'correctAnswer must not be empty.').isLength({ min: 1 }).trim(),

  
    // Sanitize fields.
    sanitizeBody('*').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Question object with escaped and trimmed data.
        var question = new Question(
          { question: req.body.question,
            correctAnswer: req.body.correctAnswer,
            fakeAnswer1: req.body.fakeAnswer1,
            fakeAnswer2: req.body.fakeAnswer2,
            fakeAnswer3: req.body.fakeAnswer3,
            fakeAnswer4: req.body.fakeAnswer4,
            fakeAnswer5: req.body.fakeAnswer5
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({

            }, function(err, results) {
                if (err) { return next(err); }
                console.log("question render"),
                res.render('question_form', { title: 'Create Question',question: question, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save question.
            question.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new question record.
                   res.redirect(question.url);
                });
        }
    }
];



// Display question delete form on GET.
exports.question_delete_get = function(req, res, next) {

    async.parallel({
        question: function(callback) {
            Question.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.question==null) { // No results.
            res.redirect('/game/questions');
        }
        // Successful, so render.
        res.render('question_delete', { title: 'Delete Question', question: results.question } );
    });

};

// Handle question delete on POST.
exports.question_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        question: function(callback) {
            Question.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
            // Delete object and redirect to the list of questions.
        Question.findByIdAndRemove(req.body.id, function deleteQuestion(err) {
            if (err) { return next(err); }
            // Success - got to questions list.
            res.redirect('/game/questions');
        });
    });

};

// Display question update form on GET.
exports.question_update_get = function(req, res, next) {

    // Get question, authors and genres for form.
    async.parallel({
        question: function(callback) {
            Question.findById(req.params.id).exec(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.question==null) { // No results.
                var err = new Error('Question not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('question_form', { title: 'Update Question', question: results.question });
        });

};


// Handle question update on POST.
exports.question_update_post = [

    // Convert the question to an array.
    (req, res, next) => {
        if(!(req.body.question instanceof Array)){
            if(typeof req.body.question==='undefined')
            req.body.question=[];
            else
            req.body.question=new Array(req.body.question);
        }
        next();
    },
   
    // Validate fields.
    body('question', 'question must not be empty.').isLength({ min: 1 }).trim(),
    body('correctAnswer', 'correctAnswer must not be empty.').isLength({ min: 1 }).trim(),

  
    // Sanitize fields.
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Question object with escaped/trimmed data and old id.
           var question = new Question(
            { question: req.body.question,
              correctAnswer: req.body.correctAnswer,
              fakeAnswer1: req.body.fakeAnswer1,
              fakeAnswer2: req.body.fakeAnswer2,
              fakeAnswer3: req.body.fakeAnswer3,
              fakeAnswer4: req.body.fakeAnswer4,
              fakeAnswer5: req.body.fakeAnswer5,
              _id:req.params.id
             });           

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form
            async.parallel({

            }, function(err, results) {
                if (err) { return next(err); }

                res.render('question_form', { title: 'Update Question', question: question, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Question.findByIdAndUpdate(req.params.id, question, {}, function (err,thequestion) {
                if (err) { return next(err); }
                   // Successful - redirect to question detail page.
                   res.redirect(thequestion.url);
                });
        }
    }
];

