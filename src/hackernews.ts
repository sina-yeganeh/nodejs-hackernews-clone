import e, { response } from 'express';
import mysql from 'mysql';
import * as path from 'path';

const app = e();
const port = 3030;

// express app setting
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(e.static(path.join(__dirname, "assets")));
app.use(e.json());
app.use(e.urlencoded({ extended: true }));

var session = { 'sendPost': false, message: "",
                'sendAsk': false
};

var database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "HackerNews"
});

database.connect((err) => {
    if (err) console.error(`can't connect to database:${err}`);
    else console.log("connected to database!");
});

app.get('/', (req, resp): void => {
    database.query("SELECT * FROM `Posts` ORDER BY PuplishTime DESC;", (err, result, _) => {
        if (err) console.error(`can't select posts tabel:${err}`);
        else resp.render('pages/hackernews', { posts: result });
    });
});

app.get('/new-post', (req, reps): void => {
    if (session.sendPost) reps.render("pages/new-post", { message: session.message });
    else reps.render('pages/new-post', { message: session.message });

    session.message = "";
});

app.post('/create-new-post', (req, resp): void => {
    const title = req.body.title;
    const url = req.body.url;
    const author  = req.body.author;

    var date = new Date().toUTCString();

    if (title && url && author) {
        database.query('INSERT INTO Posts (Title, Link, Author, PuplishTime) VALUE (?, ?, ?, ?)', [title, url , author, date], (err) => {
            if (err) console.error(`can't insert into database: ${err}`);
            else {
                session.sendPost = true;
                session.message = "پست شما با موفقیت ثبت شد!";
                resp.redirect('/new-post');
            }
        });
    } else {
        session.message = "لطفا همه ی فیلد ها را کامل کنید!";
        resp.redirect('/new-post');
    }
});

app.get('/asks', (req, resp): void => {
    database.query("SELECT * FROM `Asks` ORDER BY PuplishTime DESC", (err, result, _) => {
        if (err) console.error(`can't select asks:${err}`);
        else resp.render('pages/asks', { asks: result, message: session.message });
        
        session.message = "";
    });
});

app.post('/create-new-ask', (req, resp): void => {
    const title = req.body.title;
    const body = req.body.body;
    const author = req.body.author;

    var date = new Date().toUTCString();

    if (title && body && author) {
        database.query("INSERT INTO `Asks` (Title, Body, Author, PuplishTime) VALUE (?, ?, ?, ?)", [title, body, author, date], (err) => {
            if (err) console.error(`can't insert to database:${err}`);
            else {
                session.sendAsk = true;
                session.message = "سوال شما با موفقیت ارسال شد!";
                resp.redirect('/asks');
            }
        });
    } else {
        session.message = "لطفا همه ی فیلد ها را کامل کنید!";
        resp.redirect('/asks')
    }
});

app.get('/about', (req, resp) => {
    resp.render("pages/about");
});

app.listen(port, (): void => console.log(`hackernew is running in port ${port}`));
