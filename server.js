const express = require("express");
const path = require("path");
const data = require("./data-service.js");
const exphbs= require("express-handlebars")
// const bodyParser = require('body-parser');
const fs = require("fs");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

const app = express();
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
 defaultLayout:'main', 
helpers:{
    navLink: function(url, options){
    return '<li' + 
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';},
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
        
}
} ));
app.set('view engine', '.hbs');



const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'Cloud Name',
    api_key: 'API Key',
    api_secret: 'API Secret',
    secure: true
});

app.use(function(req, res, next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      // we write the filename as the current date down to the millisecond
      // in a large web service this would possibly cause a problem if two people
      // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
      // this is a simple example.
      cb(null, Date.now() + path.extname(file.originalname));
    }
});

// tell multer to use the diskStorage function for naming files instead of the default.
// const upload = multer({ storage: storage });
const upload = multer();

app.use(express.static('public'));

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req,res) => {
    res.render(path.join(__dirname, "/views/home.hbs"));
});

app.get("/about", (req,res) => {
    res.render(path.join(__dirname, "/views/about.hbs"));
});

app.get("/images/add", (req,res) => {
    res.render(path.join(__dirname, "/views/addImage.hbs"));
});

app.get("/students/add", (req,res) => {
    res.render(path.join(__dirname, "/views/addStudent.hbs"));
});

app.get("/images", (req,res) => {
     fs.readdir("./public/images/uploaded", function(err, items) {
      res.render({images:items});
    });
    data.getImages().then((data) => {
        res.render({images:items});
    }).catch((err) => {
        res.json({ message: "no results" });
    });
});

app.get("/students", (req, res) => {
    if (req.query.status) {
        data.getStudentsByStatus(req.query.status).then((data) => {
             res.render("students", {students: data})
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    } else if (req.query.program) {
        data.getStudentsByProgramCode(req.query.program).then((data) => {
             res.render("students", {students: data})
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    } else if (req.query.credential) {
       data.getStudentsByExpectedCredential(req.query.credential).then((data) => {
         res.render("students", {students: data})
       }).catch((err) => {
        res.render("students", {message: "no results"});
       });
    } else {
        data.getAllStudents().then((data) => {
             res.render("students", {students: data})
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    }
});

app.get("/student/:studentId", (req, res) => {
    data.getStudentById(req.params.studentId).then((data) => {
        res.render("student", { student: data }); 
    }).catch((err) => {
        res.render("student",{message: "no results"}); 
    });
});



app.get("/programs", (req,res) => {
    data.getPrograms().then((data)=>{
        res.render("programs", {programs: data});    });
});


app.post("/students/add", (req, res) => {
    data.addStudent(req.body).then(()=>{
      res.redirect("/students");
    });
});

app.post("/student/update", (req, res) => {
    console.log(req.body);
    res.redirect("/students");
});


app.post("/images/add", upload.single("imageFile"), (req,res) =>{
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processForm(uploaded.url);
        });
    }else{
        processForm("");
    }

    function processForm(imageUrl){
        
        // TODO: Process the image url on Cloudinary before redirecting to /images
        data.addImage(imageUrl).then(img=>{ // the "addImage" function is not created yet.
            res.render({images:items});
        }).catch(err=>{
            res.status(500).send(err);
        })
        // res.send("The uploaded image on Cloudinary: <img src=" + imageUrl + " />")
    }   
    
});


app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });

data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});

