const DABASE_NAME = 'M2WEB'
const collection  = 'contacts' // {_name, _age} collection
const MONGO_URL = 'mongodb://localhost:27017';

import express from 'express';
import morgan  from 'morgan';
import path    from 'path';
import swaggerUI from 'swagger-ui-express';
import YAML    from 'yaml';
import { readFileSync } from 'node:fs';
import { MongoClient, ObjectId } from 'mongodb';

process.loadEnvFile('.env');

const HOST = process.env.HOST;
const PORT = process.env.PORT;

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join('src', 'views'));

app.use(morgan('combined'));
app.use(express.json());

const openapiDocument = YAML.parse (
    readFileSync (
        new URL('../openapi.yaml', import.meta.url), 'utf8'
    )
);

app.use(
  '/api-docs',
  swaggerUI.serve,
  swaggerUI.setup(openapiDocument)
);

let contactsDB;

//__Functions____________________________________________________

async function printAllContacts(collection) {
    const contacts = await collection.find().toArray();
    for (const contact of contacts)
      { console.log(`Contact [${contact._id}] : ${contact._name} is ${contact._age}`); }
}

//---------------------------------------------------------------

function formatContact(contact) {
    return JSON.stringify ({
        name: contact._name,
        age:  contact._age.toString()
    });
}

//---------------------------------------------------------------

function isValidID(id)
  { return (ObjectId.isValid(id)); }

//---------------------------------------------------------------

function isValidName(name)
  { return (typeof name === 'string' && name.trim() !== ''); }

//---------------------------------------------------------------

function isValidAge(age)
  { return (Number.isInteger(age) && age >= 0); }

//__REST-requests________________________________________________

app.get('/', (req, res) => {
    res.send('Hello !');
});

app.get('/home', (req, res) => {
    res.send('Welcome Home :-)');
});

app.get('/user/:uid', (req, res) => {
    res.render('user', {uid: req.params.uid});
});

// Lists contacts
app.get('/contacts', async (req, res) => {
    try {
        const contacts = await contactsDB.find({}).toArray();
        return res.status(200).json({
            contacts: contacts.map(formatContact)
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: 'Erreur interne du serveur'
        });
    }
});

// Get a specific contact from its ID
app.get('/contacts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidID(id)) {
            return res.status(400).json({
                error: 'ID invalide'
            });
        }

        const contact = await contactsDB.findOne({
            _id: new ObjectId(id)
        });
        if (!contact) {
            return res.status(404).json({
                error: 'Contact introuvable'
            });
        }

        return res.status(200).json(formatContact(contact));
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: 'Erreur interne du serveur'
        });
    }
});

// Adds a contact
app.post('/contacts', async (req, res) => {
    try {
        const { name, age } = req.body;
        if (!isValidName(name) || !isValidAge(age)) {
            return res.status(400).json({
                error: 'Données invalides'
            });
        }

        const newContact = await contactsDB.insertOne({
            _name: name.trim(),
            _age: age
        });
        if (!newContact) {
            return res.status(404).json({
                error: 'Contact introuvable'
            });
        }

        return res.status(201).json({
            _id: newContact.insertedId.toString(),
            _name: name.trim(),
            _age: age
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: 'Erreur interne du serveur'
        });
    }
});

// Change a contact's name & age
app.put('/contacts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age } = req.body;
        if (!isValidID(id) || !isValidName(name) || !isValidAge(age)) {
            return res.status(400).json({
                error: 'Données invalides'
            });
        }

        const result = await contactsDB.updateOne (
            { _id: new ObjectId(id) },
            { $set: { _name: name, _age: age } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Contact introuvable'
            });
        }

        const updatedContact = await contactsDB.findOne({
            _id: new ObjectId(id)
        });

        return res.status(200).json({
            _id: updatedContact._id.toString(),
            _name: name.trim(),
            _age: age
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: 'Erreur interne du serveur'
        });
    }
});

// Delete contact by its ID
app.delete('/contacts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidID(id)){
            return res.status(400).json({
                error: 'Données invalides'
            });
        }

        const deletedContact = await contactsDB.deleteOne({
            _id: new ObjectId(id)
        });
        if (deletedContact.deleteCount === 0) {
            return res.status(404).json({
                error: 'Contact introuvable'
            });
        }

        return res.status(204).end();
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: 'Erreur interne du serveur'
        });
    }
});

//---------------------------------------------------------------

app.use((req, res) => {
  res.status(404).send('Page introuvable !');
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`)
});

//== MAIN =======================================================

async function main() {
    let client;
    try {
        console.log('Trying to connect...')
        const client = new MongoClient(MONGO_URL);
        const db = client.db(DABASE_NAME);
        console.log("Successfully connected to MongoDB " + db);
        contactsDB = db.collection(collection);
        await client.connect();
        await printAllContacts(contactsDB);
    } catch (e) {
        console.error(e);
    } finally {
        if (client) { client.close(); }
    }
} main();
