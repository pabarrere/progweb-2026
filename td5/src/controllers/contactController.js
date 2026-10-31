import Contact from '../models/contactModel.js';
import { ObjectId } from 'mongodb';

//__Validation functions_________________________________________

function isValidID(id)
  { return (ObjectId.isValid(id)); }

//---------------------------------------------------------------

function isValidName(name)
  { return (typeof name === 'string' && name.trim() !== ''); }

//---------------------------------------------------------------

function isValidAge(age)
  { return (Number.isInteger(age) && age >= 0); }

//__JSON functions_______________________________________________

function formatContact(contact) {
    return JSON.stringify ({
        id:   contact._id,
        name: contact._name,
        age:  contact._age
    });
}

//---------------------------------------------------------------

function errorFormat_invalidData(msg) {
    return {
        success: false,
        status: 400,
        message: "Invalid " + msg
    };
}

//---------------------------------------------------------------

function errorFormat_cannotFind(msg) {
    return {
        success: false,
        status: 404,
        message: msg + " cannot be found"
    };
}

//---------------------------------------------------------------

function errorFormat_internalServer() {
    return {
        success: false,
        status: 500,
        message: "Internal server error"
    };
}

//__REST-request functions_______________________________________

// Get all contacts
export async function getAllContacts() {
    let total = await Contact.countDocuments({});
    let limit = parseInt(total);

    try {
        const contacts = await Contact.find().limit(limit);
        if (!contacts)
          { return errorFormat_cannotFind("Contacts"); }
        return {
            success: true,
            data: contacts.map(formatContact),
            total: total
        };
    } catch (err) {
        console.error(e);
        return errorFormat_internalServer();
    }
}

//---------------------------------------------------------------

// Get a specific contact from its ID
export async function getContactById(id) {
    try {
        if (!isValidID(id))
          { return errorFormat_invalidData("ID"); }

        const contact = await Contact.findById(id);
        if (!contact)
          { return errorFormat_cannotFind("Contact"); }

        return {
            success: true,
            data: formatContact(contact)
        };
    } catch (e) {
        console.error(e);
        return errorFormat_internalServer();
    }
}

//---------------------------------------------------------------

// Add a new contact, returns the added contact
export async function addContact(body) {
    try {
        const { name, age } = body;
        if (!isValidName(name) || !isValidAge(age))
          { return errorFormat_invalidData("data"); }

        const newContact = await Contact.insertOne({
            _name: name.trim(),
            _age: age
        });
        if (!newContact)
          { return errorFormat_cannotFind("Added contact"); }

        console.log("> Contact " + name.trim() + " added with ID " + newContact._id);
        return {
            success: true,
            data: formatContact(newContact)
        };
    } catch (e) {
        console.error(e);
        return errorFormat_internalServer();
    }
}

//---------------------------------------------------------------

// Update an existing contact
export async function updateContact(id, name = null, age = null) {
    try {
        if (!isValidID(id))
          { return errorFormat_invalidData("ID"); }
        if (name !== null && !isValidName(name))
          { return errorFormat_invalidData("name"); }
        if (age !== null && !isValidAge(age))
          { return errorFormat_invalidData("age"); }
        if (name === null && age === null)
          { return errorFormat_invalidData("data. Name and age are null. Nothing to change for the contact"); }

        // Finds the contact to update
        const contact = await Contact.findOne({
            _id: new ObjectId(id)
        });
        if (!contact)
          { return errorFormat_cannotFind("Contact to update"); }
        if (name === null)
          { name = contact._name; }
        if (age === null)
          { age = contact._age; }

        // Updates the contact
        const result = await Contact.updateOne(
            { _id: new ObjectId(id) },
            { $set: { _name: name, _age: age } }
        )
        if (result.matchedCount === 0)
          { return errorFormat_cannotFind("Updated contact"); }

        return {
            success: true,
            data: "Contact [" + id + "] successfully updated"
        };
    } catch (e) {
        console.error(e);
        return errorFormat_internalServer();
    }
}

//---------------------------------------------------------------

// Remove an existing contact
export async function removeContact(id) {
    try {
        if (!isValidID(id))
          { return errorFormat_invalidData("ID"); }

        const deletedContact = await Contact.deleteOne({
            _id: new ObjectId(id)
        });
        if (deletedContact.deletedCount === 0)
          { return errorFormat_cannotFind("Contact to delete"); }

        console.log("> Contact " + id + " deleted");
        return {
            success: true,
            data: "Contact [" + id + "] successfully deleted"
        };
    } catch (e) {
        console.error(e);
        return errorFormat_internalServer();
    }
}
