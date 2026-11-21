import Contact from '../models/contactModel.js';
import redisClient from '../config/redis.js';

const LATENCY_SIMULATION = 2000;
const TTL = 60;

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// Get all contacts with Cache
export async function getAllContacts() {
    try {
        const cacheKey = 'contacts:all';
        const cachedContacts = await redisClient.get(cacheKey);
        if (cachedContacts) {
            console.log('CACHE HIT: contacts:all');
            return JSON.parse(cachedContacts);
        }

        console.log('CACHE MISS: contacts:all');
        await delay(LATENCY_SIMULATION);

        const total = await Contact.countDocuments({});
        const contacts = await Contact.find().limit(parseInt(total));
        const response = {
            success: true,
            data: contacts,
            total: total.toString(),
        };

        await redisClient.setEx (
            cacheKey,
            TTL,
            JSON.stringify(response)
        );

        return response;
    } catch (err) {
        return {
            success: false,
            message: "Contacts not found " + err
        };
    }
}

// Get contact by Id
export async function getContactById(id) {
    try {
        const cacheKey = `contacts:${id}`;
        const cachedContact = await redisClient.get(cacheKey);
        if (cachedContact) {
            console.log(`CACHE HIT: ${cacheKey}`);
            return JSON.parse(cachedContact);
        }

        console.log(`CACHE MISS: ${cacheKey}`);
        await delay(LATENCY_SIMULATION);

        const contact = await Contact.findById(id);
        if (!contact) {
            return {
                success: false,
                message: "Contact not found"
            };
        }

        const response = {
            success: true,
            data: contact
        };

        await redisClient.setEx (
            cacheKey,
            TTL,
            JSON.stringify(response)
        );

        return response;
    } catch (err) {
        return {
            success: false,
            message: "Error finding contact " + err
        };
    }
}

// Add a new contact, returns the added contact
export async function addContact(body) {
  try {
    const contact = new Contact(body);
    await contact.save();
    await redisClient.del('contacts:all');
    return { success: true, data: contact };
  } catch (err) {
    return { success: false, message: "Error adding contact " + err };
  }
}

// Update an existing contact
export async function updateContact(id, name = null, age = null) {
  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      return { success: false, message: "Contact not found" };
    }
    if (name !== null) contact.name = name;
    if (age !== null) contact.age = age;
    await contact.save();
    await redisClient.del ([
        'contacts:all',
        `contacts:${id}`
    ]);
    return { success: true, data: contact };
  } catch (err) {
    return { success: false, message: "Error updating contact " + err };
  }
}


// Remove an existing contact
export async function removeContact(id) {
  try {
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return { success: false, message: "Contact not found" };
    }
    await redisClient.del ([
        'contacts:all',
        `contacts:${id}`
    ]);
    return { success: true, message: "Contact deleted successfully" };
  } catch (err) {
    return { success: false, message: "Error deleting contact " + err };
  }
}
