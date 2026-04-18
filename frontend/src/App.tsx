import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useContext } from "react";
import AuthForm from "./components/AuthForm";
import { AuthContext } from "./context/AuthContext";
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
  const auth = useContext(AuthContext);
  useEffect(() => {
    axios
      .get<Destination[]>(`${import.meta.env.VITE_API_URL}/destinations`)
      .then((res) => setDestinations(res.data))
      .catch((err) => console.error(err.message));
  }, []);

  return (
    <Router>
      <nav className="p-6 bg-white border-b flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-xl font-bold tracking-tighter">
          TOURISM<span className="text-blue-600">.</span>
        </Link>
        <div className="flex items-center gap-6">
          {auth?.token && (
            <Link to="/dashboard" className="text-sm font-medium text-gray-600">
              Dashboard
            </Link>
          )}
          {auth?.token ? (
            <Button
              variant="outline"
              onClick={auth.logout}
              className="rounded-full"
            >
              Logout
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="rounded-full">
                Login
              </Button>
            </Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div className="bg-white min-h-screen">
              <section className="h-[50vh] flex flex-col items-center justify-center text-center px-4 bg-gray-50 border-b">
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
                  Explore The Beautiful World.
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

              <section id="list" className="max-w-7xl mx-auto py-16 px-6">
                <h2 className="text-3xl font-bold tracking-tight mb-12">
                  All Destinations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {destinations.map((d) => (
                    <div key={d._id} className="group flex flex-col">
                      <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-gray-100 shadow-sm">
                        <img
                          src={d.image}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          alt={d.title}
                        />
                      </div>
                      <div className="mt-4 flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900">
                            {d.title}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            {d.description
                              ? d.description.substring(0, 45)
                              : "no description available"}
                            ...
                          </p>
                        </div>
                        <p className="font-bold text-lg">${d.price}</p>
                      </div>
                      <Link to={`/destination/${d._id}`} className="mt-4">
                        <Button
                          variant="secondary"
                          className="w-full rounded-xl"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
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
