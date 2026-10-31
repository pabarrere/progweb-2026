import { Router } from 'express';
import {
    getAllContacts,
    getContactById,
    updateContact,
    removeContact,
    addContact
} from '../controllers/contactController.js';
import {
    registerUser,
    loginUser
} from '../controllers/authController.js';
import {
    requireAuth
} from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', function (req, res) {
    res.status(200).json({
        status: 'API is Working',
        message: 'Welcome!',
    });
});

//__REST-requests________________________________________________

/**--------------------------------------------------------------
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registers a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewUser'
 *           example:
 *             email: jane.doe@haddock.com
 *             password: password123
 *     responses:
 *       '201':
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRegistered'
 *             example:
 *               success: true
 *               user:
 *                 id: "6ae4cb639739afbfc794dd66"
 *                 email: jane.doe@haddock.com
 *       '400':
 *         description: Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *             example:
 *               success: false
 *               status: 400
 *               message: "Invalid ID"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 */
router.route('/auth/register').post(async (req, res) => {
    const response = await registerUser(req.body);
    const success = (response.success == true);
    return res.status((success) ? 201 : response.status).json(response);
});

/**--------------------------------------------------------------
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Logs a user in
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewUser'
 *           example:
 *             email: jane.doe@haddock.com
 *             password: password123
 *     responses:
 *       '200':
 *         description: User logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserLoggedIn'
 *             example:
 *               success: true
 *               token: "eyJhbGciOiJIUzI1NiIs..."
 *       '400':
 *         description: Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *             example:
 *               success: false
 *               status: 400
 *               message: "Invalid ID"
 *       '401':
 *         description: Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *             example:
 *               success: false
 *               status: 401
 *               message: "Unauthorized user"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 */
router.route('/auth/login').post(async (req, res) => {
    const response = await loginUser(req.body);
    const success = (response.success == true);
    return res.status((success) ? 200 : response.status).json(response);
});

//---------------------------------------------------------------

// requireAuth must be checked before using any request on /contacts
router.use('/contacts', requireAuth);

/**
 * @openapi
 * /contacts:
 *   get:
 *     summary: List all contacts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Returns all the contacts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AllContactsResponse'
 *             example:
 *               success: true
 *               data:
 *                 - id: "6ae4cb639739afbfc794dd66"
 *                   name: "Alice"
 *                   age: 25
 *                 - id: "6ae4cb639739afqerhs84613"
 *                   name: "Bob"
 *                   age: 28
 *               total: 2
 *       '401':
 *         description: Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *       '404':
 *         description: Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 */
router.route('/contacts').get(async (req, res) => {
    const response = await getAllContacts();
    const success = (response.success == true);
    return res.status((success) ? 200 : 404).json(response);
});


/**--------------------------------------------------------------
 * @openapi
 * /contacts/{id}:
 *   get:
 *     summary: Get a contact using its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB ID of the contact
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Contact found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: "6ae4cb639739afbfc794dd66"
 *                 name: "Alice"
 *                 age: 25
 *       '400':
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *       '401':
 *         description: Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *       '404':
 *         description: Cannot find contact
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 */
router.route('/contacts/:id').get(async (req, res) => {
    const { id } = req.params;

    const response = await getContactById(id);
    const success = (response.success == true);
    return res.status((success) ? 200 : response.status).json(response);
});

/**--------------------------------------------------------------
 * @openapi
 * /contacts:
 *   post:
 *     summary: Registers a contact
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewContact'
 *           example:
 *             name: Alice
 *             age: 25
 *     responses:
 *       '201':
 *         description: Contact registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *             example:
 *               success: true
 *               status: 201
 *               message: "Contact successfully registered"
 *       '400':
 *         description: Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *             example:
 *               success: false
 *               status: 400
 *               message: "Invalid ID"
 *       '401':
 *         description: Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *       '404':
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *             example:
 *               success: false
 *               status: 404
 *               message: "Added contact not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 */
router.route('/contacts').post(async (req, res) => {
    const response = await addContact(req.body);
    const success = (response.success == true);
    return res.status((success) ? 201 : response.status).json(response);
});

/**--------------------------------------------------------------
 * @openapi
 * /contacts/{id}:
 *   put:
 *     summary: Updates a contact
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewContact'
 *           example:
 *             name: Alice
 *             age: 25
 *     responses:
 *       '200':
 *         description: Contact registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *             example:
 *               success: true
 *               status: 200
 *               message: "Contact successfully updated"
 *       '400':
 *         description: Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *             example:
 *               success: false
 *               status: 400
 *               message: "Invalid ID"
 *       '401':
 *         description: Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *       '404':
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *             example:
 *               success: false
 *               status: 404
 *               message: "Contact to update not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 */
router.route('/contacts/:id').put(async (req, res) => {
    const { id }        = req.params;
    const { name, age } = req.body;
    const response = await updateContact(id, name, age);
    const success = (response.success == true);
    return res.status((success) ? 200 : response.status).json(response);
});

/**--------------------------------------------------------------
 * @openapi
 * /contacts/{id}:
 *   delete:
 *     summary: Deletes a contact
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '204':
 *         description: Contact deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *             example:
 *               success: true
 *               status: 204
 *               message: "Contact successfully deleted"
 *       '400':
 *         description: Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *             example:
 *               success: false
 *               status: 400
 *               message: "Invalid ID"
 *       '401':
 *         description: Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *       '404':
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 *             example:
 *               success: false
 *               status: 404
 *               message: "Contact not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailureResponse'
 */
router.route('/contacts/:id').delete(async (req, res) => {
    const { id } = req.params;

    const response = await removeContact(id);
    const success = (response.success == true);
    return res.status((success) ? 204 : response.status).json(response);
});

export default router;
