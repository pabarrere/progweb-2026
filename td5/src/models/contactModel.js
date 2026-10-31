import { Schema, model } from 'mongoose';

// Setup schema
const contactSchema = new Schema ({
    _name: { type: String },
    _age:  { type: Number }
});

export default model('Contact', contactSchema);
