
import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [token, setToken] = useState(
        () => localStorage.getItem('token')
    );

    const [contacts, setContacts] = useState([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [name, setName] = useState('');
    const [age, setAge] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Inscription / Connexion
    async function authenticate(endpoint) {
        setError('');
        setMessage('');

        try {
            const response = await fetch(`/api/auth/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            if (endpoint === 'login') {
                localStorage.setItem('token', result.token);
                setToken(result.token);
                setMessage('Connexion réussie !');
            } else {
                setMessage('Inscription réussie ! Vous pouvez vous connecter.');
            }
        } catch (err) {
            setError(err.message);
        }
    }

    // Requête API authentifiée
    async function apiFetch(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.status === 401) {
            logout();
            throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        if (!response.ok) {
            throw new Error(result.message || 'Une erreur est survenue.');
        }

        return result;
    }

    // Récupération des contacts
    async function loadContacts() {
        try {
            const result = await apiFetch('/api/contacts');
            setContacts(result.data);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        if (token) {
            loadContacts();
        }
    }, [token]);

    // Ajout / Modification
    async function saveContact(e) {
        e.preventDefault();
        setError('');

        try {
            const isEditing = editingId !== null;

            await apiFetch(
                isEditing
                    ? `/api/contacts/${editingId}`
                    : '/api/contacts',
                {
                    method: isEditing ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        age: Number(age)
                    })
                }
            );

            setName('');
            setAge('');
            setEditingId(null);

            setMessage(
                isEditing
                    ? 'Contact modifié !'
                    : 'Contact ajouté !'
            );

            await loadContacts();
        } catch (err) {
            setError(err.message);
        }
    }

    // Préparation de la modification
    function editContact(contact) {
        setEditingId(contact._id);
        setName(contact.name);
        setAge(contact.age);
    }

    // Suppression
    async function deleteContact(id) {
        if (!window.confirm('Supprimer ce contact ?')) return;

        try {
            await apiFetch(`/api/contacts/${id}`, {
                method: 'DELETE'
            });

            setMessage('Contact supprimé !');
            await loadContacts();
        } catch (err) {
            setError(err.message);
        }
    }

    // Déconnexion
    function logout() {
        localStorage.removeItem('token');
        setToken(null);
        setContacts([]);
        setMessage('');
        setError('');
    }

    // Interface de connexion
    if (!token) {
        return (
            <main>
                <h1>Gestion des contacts</h1>

                <h2>Connexion</h2>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    authenticate('login');
                }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Se connecter</button>
                </form>

                <h2>Inscription</h2>

                <button onClick={() => authenticate('register')}>
                    Créer un compte
                </button>

                {error && <p>{error}</p>}
                {message && <p>{message}</p>}
            </main>
        );
    }

    // Interface principale
    return (
        <main>
            <h1>Gestion des contacts</h1>

            <button onClick={logout}>Déconnexion</button>

            <h2>
                {editingId ? 'Modifier un contact' : 'Ajouter un contact'}
            </h2>

            <form onSubmit={saveContact}>
                <input
                    type="text"
                    placeholder="Nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="number"
                    placeholder="Âge"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                />

                <button type="submit">
                    {editingId ? 'Modifier' : 'Ajouter'}
                </button>

                {editingId && (
                    <button type="button" onClick={() => {
                        setEditingId(null);
                        setName('');
                        setAge('');
                    }}>
                        Annuler
                    </button>
                )}
            </form>

            <h2>Mes contacts</h2>

            {contacts.map((contact) => (
                <div key={contact._id}>
                    <p>
                        {contact.name} - {contact.age} ans
                    </p>

                    <button onClick={() => editContact(contact)}>
                        Modifier
                    </button>

                    <button onClick={() => deleteContact(contact._id)}>
                        Supprimer
                    </button>
                </div>
            ))}

            {error && <p>{error}</p>}
            {message && <p>{message}</p>}
        </main>
    );
}

export default App;
