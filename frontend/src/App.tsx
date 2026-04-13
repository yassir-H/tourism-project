import axios from "axios";
import { useEffect, useState } from "react";

interface Destination {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

function App() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get<Destination[]>("http://localhost:5000/api/destinations")
      .then((res) => setDestinations(res.data))
      .catch((err) => setError(err.message));
  }, []);
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Destinations</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-4">
        {destinations.map((d) => (
          <div key={d._id} className="border p-4 rounded">
            <img
              src={d.image}
              alt={d.title}
              className="w-32 h-32 object-cover"
            />
            <h3 className="font-bold">{d.title}</h3>
            <p>{d.description}</p>
            <p className="text-blue-600">${d.price}</p>
            <button className="bg-blue-500 text-white p-2 mt-2">
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default App;
