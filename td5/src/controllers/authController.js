import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET;

//__Validation functions_________________________________________

function isValidString(s)
  { return (typeof s === 'string' && s.trim() !== ''); }

//---------------------------------------------------------------

async function isNewUser(email) {
    const user = await User.findOne({ _email: email.trim() });
    return (user === null);
}

//---------------------------------------------------------------

async function isValidPassword(password, hashedPassword)
  { return await bcrypt.compare(password, hashedPassword); }

//__JSON functions_______________________________________________

function formatUser(user) {
    return {
        id:   user._id,
        email: user._email
    };
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

function errorFormat_unauthorized(msg) {
    return {
        success: false,
        status: 401,
        message: "Unauthorized " + msg
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

// Creates a new User and saves its unique hashed password
export async function registerUser(body) {
    try {
        const { email, password } = body;
        if (!isValidString(email) || !isValidString(password))
          { return errorFormat_invalidData("data"); }
        if (!(await isNewUser(email))) {
            return errorFormat_invalidData(
                "User : email " + email + " is already registered."
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            _email: email.trim(),
            _password: hashedPassword
        });
        await newUser.save();

        console.log("User [" + newUser._id + "] successfully registered");
        return {
            success: true,
            user: formatUser(newUser)
        };
    } catch (e) {
        console.error(e);

        // Duplicate Key Error (email already exists)
        if (e.code === 11000) {
            return errorFormat_invalidData(
                "User : email " + email + " is already registered."
            );
        }
        return errorFormat_internalServer();
    }
}

//---------------------------------------------------------------

// Checks the IDs by comparing passwords and generates a JWT
export async function loginUser(body) {
    try {
        const { email, password } = body;
        if (!isValidString(email) || !isValidString(password))
          { return errorFormat_invalidData("data"); }

        const user = await User.findOne({
            _email: email.trim()
        });
        if (!user)
          { return errorFormat_unauthorized("user : Unknown email."); }
        if (!(await isValidPassword(password, user._password)))
          { return errorFormat_unauthorized("password"); }

        const token = jwt.sign (
            { id: user._id },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("User [" + user._id + "] " + email + " successfully logged in");
        console.log("Token : " + token);
        return {
            success: true,
            token: token
        };
    } catch (e) {
        console.error(e);
        return errorFormat_internalServer();
    }
}
