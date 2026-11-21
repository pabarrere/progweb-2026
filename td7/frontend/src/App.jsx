import './App.css'

let backdata = [
    {
        "_id": "6ac64959107deb63562fb2cd",
        "name": "Tintin",
        "age": 17,
        "__v": 0
    },
    {
        "_id": "6ac74852d16ac30daef67d57",
        "name": "Milou",
        "age": 97,
        "__v": 0
    },
    {
        "_id": "6ac755a4a771973a3ea397bb",
        "name": "Biancastafiore",
        "age": 45,
        "__v": 0
    }
];

function App() {
    return (
        <div>
        <h1>Contacts</h1>

        {backdata.map((item) => (
            <div key={item._id}>
            <p>{item.name} - {item.age}</p>
            </div>
        ))}
        </div>
    )
}

export default App
