import { useState } from "react";
import axios from "axios";

const AdminPage = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: 0,
    image: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/destinations", form);
      alert("destination added");
    } catch (err) {
      console.error(err);
      alert("Failed to add destination");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2x1 font-bold mb-4">Add new destination</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          aria-label="title"
          placeholder="title"
          type="text"
          className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          aria-label="description"
          placeholder="description"
          className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          aria-label="location"
          placeholder="location"
          type="text"
          className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <input
          aria-label="price"
          placeholder="price"
          type="number"
          className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
        <input
          aria-label="image"
          placeholder="image URL"
          className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
        <button
          aria-label="submit"
          type="submit"
          className="bg-blue-600 text-white p-2 w-full"
        >
          Add Destination
        </button>
      </form>
    </div>
  );
};
export default AdminPage;
