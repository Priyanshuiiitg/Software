var objs = [];
const exp = require("express");
const fetch = require("node-fetch");
require("dotenv").config();
const app = exp();
const fload = require("express-fileupload");
const ffmpeg = require("fluent-ffmpeg");
const { fstat } = require("fs");
var fs = require("fs");
const http = require("http");
let wav = require("node-wav");
const port = process.env.port || 3000;
app.use(exp.static("public"));
app.use(fload({
    useTempFiles: true,
    tempFileDir: '/auxiliary/'
}));
let file;
var check;

app.use(exp.urlencoded({ extended: true }));
app.use(exp.json());
app.set("view engine", "ejs");

ffmpeg.setFfmpegPath("C:/ffmpeg-2022-12-21-git-eef763c705-full_build/bin/ffmpeg.exe");
ffmpeg.setFfprobePath("C:/ffmpeg-2022-12-21-git-eef763c705-full_build/bin");
ffmpeg.setFlvtoolPath("C:/ffmpeg-tools-2022-01-01-git-d6b2357edd");

app.get("/", function (req, res) {
    res.render("home", { text: "Hey folks, this is a deployed web application  to convert your Videos to Audio files  and download it for free. Besides this you can also add timestamps,tags and comments relevant to your audio file and download the text file to keep the track of every important timelines. " });

})

app.get("/action", function (req, res) {
    res.render("action");

})
app.get("/timestamps", function (req, res) {
    res.render("timestamps");


})
app.get("/compose", function (req, res) {
   


    res.render("compose", { posts: objs });


})
app.get("/play", function (req, res) {

    res.writeHead(200, { 'Content-Type': 'audio/mp3' });
    let opStream = fs.createReadStream("auxiliary/" + file.name);
    opStream.pipe(res);
   



})

app.get("/contact", function (req, res) {
    res.render("contact");

})

app.post("/download",function(req,res){
   res.download("./public/notes.txt","./public/notes.txt",function(err){
    if(err)
    console.log(err);
    else
    fs.truncateSync("./public/notes.txt",0,function(){
        console.log("Successfully completed");
    })
   })
 

})





app.post("/action", function (req, res) {


    let to = req.body.to;
    console.log(to);
    let file = req.files.video;
    console.log(file.name);
    let fileName = `output.${to}`;
    // console.log(to);
    // console.log(file);
    file.mv("auxiliary/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File uploaded successfully!!");
    });
    ffmpeg("auxiliary/" + file.name).withOutputFormat(to).on('end', function (stdout, stderr) {
        console.log("Finished");
        res.download(__dirname + fileName, function (err) {
            if (err)
                throw err;



            fs.unlink(__dirname + fileName, function (err) {
                if (err) throw err;
                console.log("File deleted successfully");
            });

        });
        fs.unlink("auxiliary/" + file.name, function (err) {
            if (err) throw err;
            console.log("File deleted successfully");
        });


    }).on("error", function (err) {
        console.log("Error!!");
        fs.unlink("auxiliary/" + file.name, function (err) {
            if (err) throw err;
            console.log("File deleted successfully");

        })
    }).saveToFile(__dirname + fileName);
})


app.post("/timestamps", function (req, res) {
    file = req.files.video;
   

    // filename=file.name;
    check="./auxiliary/"+file.name;
    
    file.mv("./auxiliary/"+file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File uploaded successfully!!");
       res.redirect("/play");
       

    });
    
    



})
app.post("/compose", function (req, res) {
    var obj = {
        txt1: req.body.txt1,
        txt2: req.body.txt2,
        txt3: req.body.txt3
    }
    objs.push(obj);

    fs.appendFile("./public/notes.txt","{TimeStamp:"+obj.txt1+", Tag:"+obj.txt2+", Comment: "+obj.txt3+"}\n","utf-8",function(err){
        if(err)
        console.log(err);
        else
        console.log("File written successfully");
    })

    res.redirect('/compose');


})




app.listen(port, function () {
    console.log("Server running on " + port);
})

function perform(aux) {
    new Audio("auxiliary/" + aux).play();
}