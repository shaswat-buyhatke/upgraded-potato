const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer');
const app = express();
app.use(express.static(__dirname + 'videos'))
app.use(express.json());
 
const fileStorageEngine = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null , './videos')
    },
    filename : (req , file , cb) => {
        cb(null , file.originalname)
    }  
})

app.use(express.urlencoded({ extended: true }));

const upload = multer({storage : fileStorageEngine})
app.get('/', (req, res) => {
    res.sendFile(__dirname + '\\index.html');
})
  
app.post('/single' , upload.single('video') ,(req,res) => {
    console.log(req.file);
    res.send('Single file upload succesfull');
})

app.get('/watch',(req,res) => {
    console.log('WATASHIWA ' , req.range);
    console.log('WHAT ',req.query.x);
    const path = 'C:\\Users\\shasw\\OneDrive\\Desktop\\File Upload App\\videos\\' + req.query.x + '.mp4';
    console.log("HERE: " , path);
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (typeof(range) != 'undefined') {
        console.log('never here :(');
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = fileSize-1
        console.log('start ' , start);
        console.log('end ' , end);

        const chunksize = (end-start)+1
        console.log('chunk size ' , chunksize);
        const file = fs.createReadStream(path, {start, end})
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }
        console.log(`bytes ${start}-${end}/${fileSize}`);
        res.writeHead(206, head)
        file.pipe(res)
      }else{
        console.log('here');
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',

        }
        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
    }
    // res.send(`<video id="videoPlayer" controls> <source src="${path}"   type="video/mp4"> </video>`);
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '\\index.html');
})

app.listen(5000);