import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const DestinationDetail = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState<any>(null);
  const [date, setDate] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/destinations/${id}`)
      .then((res) => setDestination(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    alert(`booking request sent for ${destination.title} on ${date}`);
  };

  if (!destination) return <p>Loading...</p>;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{destination.title}</h1>
      <img
        src={destination.image}
        alt={destination.title}
        className="w-full h-64 object-cover my-4"
      />
      <p>{destination.description}</p>

      <form onSubmit={handleBooking} className="mt-6 border p-4 rounded">
        <h3 className="font-bold mb-2">Book this Trip</h3>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
};
export default DestinationDetail;
