import express from 'express';
import morgan  from 'morgan';
import path    from 'path';

process.loadEnvFile('.env');

const HOST = process.env.HOST;
const PORT = process.env.PORT;

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join('src', 'views'));

app.use(morgan('combined'));

app.get('/', (req, res) => {
    res.send('Hello !');
});

app.get('/home', (req, res) => {
  res.send('Maison :-)');
});

app.get('/user/:uid', (req, res) => {
  res.render('user', {uid: req.params.uid});
});

app.use((req, res) => {
  res.status(404).send('Page introuvable !');
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`)
});
