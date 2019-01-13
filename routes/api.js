/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app, db) {

  app.route('/api/books')
    .get(function (req, res){
      db.collection('books').find({},{comments: 0}).toArray((err,books) => {
        if(books){
          res.json(books)
        } else {
          res.send('something wrong! try again later!');
        }
        
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if(title){
        db.collection('books').insertOne({title: title, comments: [], commentcount: 0 }, (err, data)=>{
          if(data.insertedCount){
            res.json({
              title: data.ops[0].title,
              comments: data.ops[0].comments,
              _id: data.ops[0]._id
            });
          } else {
            res.send("something worng! try again later!")
          }
        })
      } else {
        res.send("missing title")
      }
      
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
       db.collection('books').drop((err,data) => {
        if(data){
          res.send('complete delete successfull');
        } else {
          res.send('something wrong! try again later!');
        }
      })
    });


  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      db.collection('books').findOne({_id: ObjectId(bookid)},{commentcount: 0},(err,book) => {
        if(book){
          res.json(book);
        } else {
          res.send('no book exists')
        }
      })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      db.collection('books').findAndModify({_id: ObjectId(bookid)},{}, {$inc: {commentcount: 1}, $push: {comments: comment}},{new: true, upsert: true}, (err,book) => {
        if(book){
          res.json(book.value);
        }
      })
    })
    
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      db.collection('books').deleteOne({_id: ObjectId(bookid)}, (err,data) => {
        if(data){
          res.send('delete successful')
        } else {
          res.send('something wrong! try again later!');
        }
      })
    });
  
};
