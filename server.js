const express = require('express');
const app = express();
const http = require('http').createServer(app);
const mysql = require('mysql');
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require('connect-flash');

app.use(flash());

app.use(session({
	secret: 'secret cat is under 75684',
    cookie:{maxAge:600000},
	resave: true,
	saveUninitialized: false
}));

app.use(express.urlencoded());
app.use(express.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

app.set('view engine','ejs');
app.use(express.static("public"));
app.listen(8080);

app.get('/',(req,res)=>{
    if(req.session.id){
        res.render('index',{isLoggedIn:req.session.loggedIn,username:req.session.username});
    }else{
        res.render('index',{isLoggedIn:req.session.loggedIn});
    }
    
});

app.get('/login',(req,res)=>{
    if(req.session.username){
        res.redirect('/');
    }else{
        res.render('login',{message:req.flash("msg")});
    }
    
});

app.post('/login_check',(req,res)=>{
    var conn = mysql.createConnection({
        host:"localhost",
        user:"root",
        password:""
    });
    var roll = req.body.roll;
    var password = req.body.pwd;
    // console.log(req.body.roll);
    conn.query(`SELECT * FROM mit.student WHERE student_roll = ? AND student_password = ?`,[roll,password],(err,result,fields)=>{
        if(result.length > 0){
            req.session.loggedIn = true;
            req.session.username = result[0]["student_name"];
            req.session.email = result[0]["email"];
            req.session.phone = result[0]["phone"];

            if(result[0]["role"] == "admin"){
                req.session.save(function (err) {
                    if (err) return next(err);
                    res.redirect('/admin');
                });
            }else{
                req.session.save(function (err) {
                    if (err) return next(err);
                    res.redirect('/');
                });
            }
        }else{
            req.flash("msg","Wrong Roll Number Or Password!");
            res.redirect("/login");
        }
    });
});

app.get('/admin',(req,res)=>{
    res.render('admin',{username:req.session.username});
});

app.get('/logout',(req,res)=>{
    req.session.destroy(function(err) {
        // cannot access session here
        if(err) throw err;
      })
    res.redirect('/');
});

app.get('/signup',(req,res)=>{
    res.render('signup');
});

app.post('/signup_check',(req,res)=>{
    var techs = ["Computer Information Technology","Electrical Technology","Mechanical Technology","Civil Technology"];
    var classes = ["1st-Year","2nd-Year","3rd-Year"];
    var name = req.body.name;
    var father_name = req.body.father_name;
    var roll = req.body.roll;
    var technology = req.body.technology;
    var Class = req.body.class;
    var email = req.body.email;
    var phone = req.body.phone;
    var dob = req.body.dob;
    var pwd = req.body.pwd;
    var confirm_pwd = req.body.confirm_pwd;

    if(roll.length != 5){
        res.redirect('/signup');
    }
    console.log("Passed");
    if(check_tech(techs,technology)){
        res.redirect('/signup');
    }
    console.log("Passed");
    if(check_tech(classes,Class)){
        res.redirect('/signup');
    }
    console.log("Passed");
    if(phone.length != 11 && phone.length != 10){
        res.redirect('/signup');
    }
    console.log("Passed");
    var current_date = new Date();
    if(dob > current_date.getDate()){
        res.redirect('/signup');
    }
    console.log("Passed");
    if(pwd != confirm_pwd){
        res.redirect('/signup');
    }
    console.log("Passed");
    var conn = mysql.createConnection({
        host:"localhost",
        user:"root",
        password:""
    });
    var class_ID;
    conn.query(`SELECT * FROM mit.class WHERE class_name = ? AND class_technology = ?`,[Class,technology],(err,result,fields)=>{
        if(err) throw err;
        if(result.length > 0){
            class_ID = result[0]["class_id"];
            console.log(class_ID);
        }else{
            res.redirect('/signup');
        }
    });
    console.log(class_ID);
    var query = `INSERT INTO mit.student(student_roll, student_name, student_father_name, student_password, class_id, role, fee_id, reg_no, email, phone, attendence_id, date_of_birth) VALUES (?)`;
    var values = [
        roll,name,father_name,pwd,'2','basic','1','54321',email,phone,'1',dob
    ];
    conn.query(query,[values],(error,result,fields)=>{
        if(error){throw error;}
        res.redirect('/login');
    });

});

app.get('/profile',(req,res)=>{
    if(req.session.username){
        res.render('profile',{username:req.session.username,email:req.session.email,phone:req.session.phone});
    }else{
        res.redirect('/login');
    }
});

function check_tech(list,tech){
    for(var i=0;i<list.length;i++){
        if(tech === list[i]){
            return false;
        }
    }
    return true;
}