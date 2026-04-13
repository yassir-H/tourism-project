import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";

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
    <Router>
      <nav className="p-4 bg-white shadow-sm flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">
          TourismProject
        </Link>
        <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded">
          Login
        </Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div className="p-8 bg-gray-50 min-h-screen">
              <h1 className="text-3xl font-bold mb-8 text-center">
                Explore Destinations
              </h1>

              {error && <p className="text-red-500 text-center">{error}</p>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {destinations.map((d) => (
                  <div
                    key={d._id}
                    className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={d.image}
                      className="w-full h-48 object-cover rounded"
                      alt={d.title}
                    />
                    <h3 className="font-bold mt-4 text-lg">{d.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {d.description}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-blue-600 font-bold text-xl">
                        ${d.price}
                      </p>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm">
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        <Route path="/login" element={<AuthForm />} />
      </Routes>
    </Router>
  );
}

export default App;
