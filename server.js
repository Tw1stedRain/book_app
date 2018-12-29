'use strict';

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');

const app = express();
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs')

// const client = new pg.Client();

const client = new pg.Client(process.env.DATABASE_URL);
client.on('err', err => console.error(err));

const PORT = process.env.PORT || 3000;

app.get('/', home);

app.post('/searches', search)

function home(request, response){
  response.render('pages/index');
}

function search(request, response){
  const searchStr = request.body.search[0];
  const searchType = request.body.search[1];
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if(searchType === 'title'){
    url += `+intitle:${searchStr}`;
  } else if(searchType === 'author'){
    url += `+inauthor:${searchStr}`
  }

  return superagent.get(url)
    .then(result => {
      let books = result.body.items.map(book => new Book(book));
      response.render('pages/searches/show', {books});
    })

}

function Book(book){
  console.log(book);
  this.title = book.volumeInfo.title || 'this book does not have a title';
  this.author = book.volumeInfo.authors || 'this book was written by no one'
  this.isbn = book.volumeInfo.industryIdentifiers
  this.image_url = book.volumeInfo.imageLinks.thumbnail
  this.description = book.volumeInfo.description || 'this book isn\'t important enough for a description'
  this.placeholderImage = 'https://i.imgur.com/J5LVHEL.jpeg';
}

app.listen(PORT, () => console.log(`APP is up on PORT : ${PORT}`));