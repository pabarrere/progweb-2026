import { Schema, model } from 'mongoose';

// Setup schema
const userSchema = new Schema ({
    _email: {
        type: String,
        required: true,
        unique: true
    },
    _password: {
        type: String,
        required: true
    }
});

export default model('User', userSchema);
