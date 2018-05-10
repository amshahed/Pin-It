'use strict';

var express = require('express');
var bp = require('body-parser');
var mongo = require('mongodb').MongoClient;
var oid = require('mongodb').ObjectID;
var app = express();
var db;

app.use(express.static(__dirname + '/'));
app.use(bp.urlencoded({ extended: false }));
var port = process.env.PORT || 8080;

mongo.connect('mongodb://127.0.0.1/', function(err, client){
	if (err)	return console.log(err);
	db = client.db('archive');

	app.listen(port, function(){
		console.log('listening on port '+port);
	})
})

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/index.html')
})

app.get('/seeimage', function(req, res){
	res.sendFile(__dirname + '/views/seeimage.html');
})

app.get('/mypins', function(req, res){
	res.sendFile(__dirname + '/views/mypins.html');
})

app.post('/addpin', function(req, res){
	var link = req.body.link;
	var title = req.body.title;
	var email = req.body.email;
	var name = req.body.name;
	db.collection('pins').insert({link, title, name, email, likes:[]}, function(err, doc){
		if (err)	res.send({error:err});
		else if (doc.result.ok==1)	res.send({inserted:true});
		else res.send({error:'Could not insert'});
	})
})

app.post('/allimages', function(req, res){
	db.collection('pins').find({}).toArray(function(err, doc){
		if (err)	res.send({error: err});
		else res.send(doc);
	})
})

app.post('/seeimages', function(req, res){
	var email = req.body.email;
	db.collection('pins').find({email:email}).toArray(function(err, doc){
		if (err)	res.send({error: err});
		else res.send(doc);
	})
})

app.post('/likeimage', function(req, res){
	var id = req.body.id;
	var email = req.body.email;
	// db.collection('pins').update({_id: oid(id)}, { $push: { likes: email } }, function(err, doc){
	// 	if (err) res.send({error: err});
	// 	else res.send({updated:true});
	// })
	db.collection('pins').find({_id:oid(id)}).toArray(function(err, doc){
		if (err)	res.send({error: err});
		else if (doc.length==0)	res.send({error:'nomatch'});
		else {
			var arr = doc[0].likes
			if (arr.includes(email))
				arr.splice(arr.indexOf(email), 1);
			else
				arr.push(email);
			db.collection('pins').update({_id:oid(id)}, { $set: { likes: arr } }, function(err, doc){
				if (err)	res.send({error: err});
				else res.send({updated:true});
			})
		}
	})
})

app.post('/delete', function(req, res){
	var id = req.body.id;
	db.collection('pins').remove({_id: oid(id)}, function(err, doc){
		if (err)	res.send({error: err});
		else	res.send({deleted:true});
	})
})