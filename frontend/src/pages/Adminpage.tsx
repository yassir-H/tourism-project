import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const AdminPage = () => {
  const auth = useContext(AuthContext);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: 0,
    image: "",
  });

  if (!auth?.token) {
    return <Navigate to="/login" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/destinations`, form, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      alert("Destination added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add destination. Are you an admin?");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-2xl font-bold mb-6">Add New Destination</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Title"
          className="border p-3 w-full rounded-lg"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          className="border p-3 w-full rounded-lg"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          placeholder="Location"
          className="border p-3 w-full rounded-lg"
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <input
          placeholder="Price"
          type="number"
          className="border p-3 w-full rounded-lg"
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
        <input
          placeholder="Image URL"
          className="border p-3 w-full rounded-lg"
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
        <button
          aria-label="submit"
          type="submit"
          className="bg-blue-600 text-white p-3 w-full rounded-lg font-bold hover:bg-blue-700 transition"
        >
          Add Destination
        </button>
      </form>
    </div>
  );
};

export default AdminPage;
