import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DestinationDetail = () => {
  const auth = useContext(AuthContext);
  const { id } = useParams();
  const [destination, setDestination] = useState<any>(null);
  const [date, setDate] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/destinations/${id}`)
      .then((res) => setDestination(res.data))
      .catch((err) => console.error(err));

    if (auth?.token) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        .then((res) => {
          const favorites = res.data.favorites;
          const found = favorites.some((f: any) => f._id === id);
          setIsFavorite(found);
        });
    }
  }, [id, auth?.token]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.token) {
      const userWantsToLogin = window.confirm(
        "You need to login to book a trip. Go to login page?",
      );
      if (userWantsToLogin) {
        navigate("/login");
      }

      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/bookings`,
        {
          destinationId: id,
          date: date,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        },
      );
      alert("Booking successful");
    } catch (err) {
      alert("booking failed");
    }
  };
  const toggleFavorite = async () => {
    if (!auth?.token) {
      const userWantsToLogin = window.confirm(
        "you need to login to save favorites. Go to login page?",
      );
      if (userWantsToLogin) {
        navigate("/login");
      }
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/favorites/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${auth?.token}` },
        },
      );
      setIsFavorite(!isFavorite);

      alert(isFavorite ? " removed from favorite" : "added to favorites");
    } catch (err) {
      alert("error updating favorites");
    }
  };
  if (!destination) return <p>Loading...</p>;
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900">
          {destination.title}
        </h1>
        <p className="text-blue-600 font-medium uppercase tracking-widest text-sm mt-2">
          {destination.location}
        </p>
      </div>

      <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-100 mb-8 shadow-2xl">
        <img
          src={destination.image}
          alt={destination.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">About this destination</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {destination.description}
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-none shadow-xl bg-gray-50 rounded-3xl">
            <h3 className="text-xl font-bold mb-4">Book Trip</h3>
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-gray-500">
                  Select Date
                </Label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-full bg-white border-gray-200"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full py-6 text-base shadow-lg active:scale-95 transition-all"
              >
                Confirm Booking — ${destination.price}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={toggleFavorite}
                className={`w-full rounded-full transition-colors ${isFavorite ? "text-red-500 hover:bg-red-50" : "text-gray-500"}`}
              >
                {isFavorite ? " Remove from Favorites" : " Add to Favorites"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default DestinationDetail;
