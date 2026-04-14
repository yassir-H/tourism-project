import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const auth = useContext(AuthContext);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (auth?.token) {
      axios
        .get("http://localhost:5000/api/my-bookings", {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        .then((res) => setBookings(res.data))
        .catch((err) => console.error(err));
    }
  }, [auth?.token]);

  return (
    <div className="p-8">
      <h1 className="text-2x1 font-bold mb-3"></h1>
      {bookings.length === 0 ? (
        <p>you havent booked any trips yet...</p>
      ) : (
        <div className="grid gap-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="border p-4 rounded flex justify-between items-center bg-white"
            >
              <div>
                <h3 className="font-bold text-lg">{b.destinationId?.title}</h3>
                <p className="text-gray-500">date : {b.date}</p>
              </div>
              <p className="font-bold text-blue-600">
                ${b.destinationId?.price}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
