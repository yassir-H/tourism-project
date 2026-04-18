import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const auth = useContext(AuthContext);
  const [data, setData] = useState<any>({ bookings: [], favorites: [] });

  useEffect(() => {
    if (auth?.token) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        .then((res) => {
          console.log("frontend rescieved:", res.data);
          setData({
            bookings: res.data.bookings || [],
            favorites: res.data.favorites || [],
          });
        })
        .catch((err) => console.error(err));
    }
  }, [auth?.token]);

  return (
    <div className="p-8">
      <h1 className="text-2x1 font-bold mb-3">User dasboard</h1>

      <section className="mb-8">
        <h2 className="text-x1 font-semibold mb-4">My favorites</h2>

        {data.favorites.length === 0 ? (
          <p>no favorites saved</p>
        ) : (
          data.favorites.map((f: any) => (
            <div key={f._id} className="border p-2 mb-2 bg-white">
              {f.title}
            </div>
          ))
        )}
      </section>
      <section>
        <h2 className="text-x1 font-semibold mb-4">my booked trips</h2>
        {data.bookings.length === 0 ? (
          <p>you havent booked any trips yet...</p>
        ) : (
          <div className="grid gap-4">
            {data.bookings.map((b: any) => (
              <div
                key={b._id}
                className="border p-4 rounded flex justify-between items-center bg-white"
              >
                <div>
                  <h3 className="font-bold text-lg">
                    {b.destinationId?.title}
                  </h3>
                  <p className="text-gray-500">date : {b.date}</p>
                </div>
                <p className="font-bold text-blue-600">
                  ${b.destinationId?.price}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
