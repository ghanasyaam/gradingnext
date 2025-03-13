"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Event {
  name: string;
  date: string;
  time: string;
  description: string;
  roles: { role: string; points: string }[]; // Updated type
}

const CreateEventPage = () => {
  const [eventData, setEventData] = useState<Event>({
    name: "",
    date: "",
    time: "",
    description: "",
    roles: [],
  });
  const [role, setRole] = useState("");
  const [points, setPoints] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get<Event[]>("http://localhost:8081/events");
      setEvents(response.data);
    } catch (error) {
      console.log("Error fetching events:", error);
      setEvents([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleAddRole = () => {
    if (role && points) {
      setEventData({ ...eventData, roles: [...eventData.roles, { role, points }] }); // Updated structure
      setRole("");
      setPoints("");
    }
  };

  const handleDeleteRole = (index: number) => {
    const updatedRoles = eventData.roles.filter((_, i) => i !== index);
    setEventData({ ...eventData, roles: updatedRoles });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post("http://localhost:8081/events", eventData);
      alert("Event added successfully!");
      setEventData({
        name: "",
        date: "",
        time: "",
        description: "",
        roles: [],
      });
      fetchEvents();
      router.push("/events");
    } catch (error: any) {
      console.error("Error adding event:", error);
      setError("Failed to create event. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex w-full max-w-4xl p-6 border rounded-lg shadow-lg space-x-6">
        <div className="w-1/2">
          <h1 className="text-xl font-bold mb-4">Create Event</h1>
          {error && <p className="text-red-500">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="w-full p-2 border rounded" name="name" placeholder="Event Name" value={eventData.name} onChange={handleChange} required />
            <input className="w-full p-2 border rounded" type="date" name="date" value={eventData.date} onChange={handleChange} required />
            <input className="w-full p-2 border rounded" type="time" name="time" value={eventData.time} onChange={handleChange} required />
            <textarea className="w-full p-2 border rounded" name="description" placeholder="Event Description" value={eventData.description} onChange={handleChange} required />

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Roles & Points</h2>
              <div className="flex space-x-2">
                <input className="flex-1 p-2 border rounded" type="text" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
                <input className="w-24 p-2 border rounded" type="number" placeholder="Points" value={points} onChange={(e) => setPoints(e.target.value)} />
                <button type="button" className="p-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={handleAddRole}>Add</button>
              </div>
            </div>

            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Create Event</button>
          </form>
        </div>

        <div className="w-1/2 border-l pl-6">
          <h2 className="text-lg font-semibold mb-2">Added Roles</h2>
          <ul className="space-y-2">
            {eventData.roles.map((r, index) => (
              <li key={index} className="flex justify-between p-2 border rounded items-center">
                <span>{r.role}</span>
                <span>{r.points} pts</span>
                <button className="p-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleDeleteRole(index)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
