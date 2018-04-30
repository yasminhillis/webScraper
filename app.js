const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json())
const path = require('path')
const getGenre = require('./models/queries/getGenre.js');
const getBook = require('./models/queries/getBook.js');
const getBookById = require('./models/queries/getBookId.js');
const addGenre = require('./models/queries/addGenre.js');
const addBook = require('./models/queries/addBook.js');
var morgan = require('morgan')
const fs = require('fs');
const cheerio = require('cheerio')
const request = require('request');




// const controllers = require('./controllers')
// const genres = require('./controllers/genre')
app.use(morgan('combined'))
// const books = require('./controllers/books')



app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/scrape', (req,res)=>{
  url = 'https://www.barnesandnoble.com/w/garden-of-truth-ruth-chou-simons/1126591661?ean=9780736969086#/'
  request(url, (error, response, html)=>{
    const json = {title: "", description: "", author: "", publisher: "", pages: "", image_url: ""};
    if(!error){
      const $ = cheerio.load(html);
      let title, genre, description, author, publisher, pages, image_url;
      $('.header-content').filter(function(){
        const data = $(this);
        title = data.children().first().text();
        json.title = title;
      })
      $('.contributors').filter(function(){
        const inf = $(this);
        author = inf.children().first().text();
        json.author = author
      })
      image_url = $('#pdpMainImage').attr('src');
      json.image_url=image_url;


        // const image = $(this);
        // image_url = image.attr('src',"//prodimage.images-bn.com/pimages/9780736969086_p0_v5_s550x406.jpg");
        // json.image_url = image_url;
            $('.text').filter(function(){
        const info = $(this);
        description = info.children().text();
      })
      $('.plain centered').filter(function(){
        const table = $(this);
        // publisher = table.slice(50:n());
      })

    }
    fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
      res.send('check your console')
    })
  })

})

app.get('/api/books',(req,res)=>{
  getBook.getBook((err, book)=>{
    res.json(book)
  })
})

app.get('/api/books/:id',(req,res)=>{
  getBookById.getBookById(req.params.id,(err, bookById)=>{
    res.json(bookById)
  })
})

app.get('/api/genres', (req,res)=>{
  getGenre.getGenre((err, genre)=>{
    res.json(genre)
  })
})

app.post('/api/genres', (req,res)=>{
  var genre = req.body;
  addGenre.addGenre(genre, (err, genre)=>{
    res.json(genre)
  })
})

app.post('/api/books', (req,res)=>{
  var {title, genre, description, author, publisher, pages, image_url, buy_url} = req.body;

  addBook.addBook(title, genre, description,
  author, publisher, pages, image_url,
   buy_url,(err,result)=>{
        res.json(result)
  })
})



app.listen(3000, ()=>{
  console.log('app is running on port 3000');
})
