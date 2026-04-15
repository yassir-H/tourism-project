import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import DestinationDetail from "./pages/DestinationDetail";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/Adminpage";
import { Button } from "@/components/ui/button";

interface Destination {
  _id: string;
  title: string;
  description: string;
  location: string;
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
      <nav className="p-6 bg-white border-b flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-xl font-bold tracking-tighter">
          TOURISM<span className="text-blue-600">.</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium text-gray-600">
            Dashboard
          </Link>
          <Link to="/login">
            <Button variant="outline" className="rounded-full">
              Login
            </Button>
          </Link>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div className="bg-white min-h-screen">
              <section className="h-[50vh] flex flex-col items-center justify-center text-center px-4 bg-gray-50 border-b">
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
                  Explore Beautiful Ethiopia.
                </h1>
                <p className="text-gray-500 text-lg max-w-md mb-8">
                  Simple travel experiences for the modern minimalist.
                </p>
                <Button
                  size="lg"
                  className="rounded-full px-8"
                  onClick={() =>
                    document
                      .getElementById("list")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Start Journey
                </Button>
              </section>

              <section
                id="list"
                className="max-w-4xl mx-auto py-16 px-6 space-y-20"
              >
                {destinations.map((d) => (
                  <div key={d._id} className="border-b pb-12 last:border-0">
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      <div className="min-w-[90%] aspect-video rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={d.image}
                          className="w-full h-full object-cover"
                          alt={d.title}
                        />
                      </div>
                      <div className="min-w-[90%] aspect-video rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={d.image}
                          className="w-full h-full object-cover opacity-50"
                          alt={d.title}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-3xl font-bold text-gray-900">
                          {d.title}
                        </h3>
                        <p className="text-blue-600 font-medium">
                          {d.location}
                        </p>
                        <p className="text-gray-600 mt-4 leading-relaxed">
                          {d.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-3xl font-bold text-gray-900">
                          ${d.price}
                        </p>
                        <Link to={`/destination/${d._id}`} className="mt-4">
                          <Button className="rounded-full px-6">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          }
        />
        <Route path="/login" element={<AuthForm />} />
        <Route path="/destination/:id" element={<DestinationDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
export default App;
