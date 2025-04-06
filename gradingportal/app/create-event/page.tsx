"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/Button";

interface Role {
  role: string;
  points: string;
  headcount: string;
}

interface Event {
  name: string;
  date: string;
  time: string;
  description: string;
  roles: Role[];
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
  const [headcount, setHeadcount] = useState("");
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
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleAddRole = () => {
    if (!role.trim() || !points.trim() || !headcount.trim()) {
      setError("All role fields are required.");
      return;
    }

    setEventData((prevData) => ({
      ...prevData,
      roles: [...prevData.roles, { role, points, headcount }],
    }));

    // Clear input fields after adding
    setRole("");
    setPoints("");
    setHeadcount("");
    setError(null);
  };

  const handleDeleteRole = (index: number) => {
    setEventData((prevData) => ({
      ...prevData,
      roles: prevData.roles.filter((_, i) => i !== index),
    }));
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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-3xl font-bold text-white text-center">Create New Event</h1>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Details */}
            <div>
              <label className="text-sm font-medium text-gray-700">Event Name</label>
              <input
                className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                name="name"
                placeholder="Enter event name"
                value={eventData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  name="time"
                  value={eventData.time}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                placeholder="Provide event details"
                value={eventData.description}
                onChange={handleChange}
                required
                className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            {/* Add Roles Section */}
            <div className="border-t pt-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Volunteer Roles</h2>
              <div className="flex flex-col sm:flex-row gap-3">
              <input
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
                type="text"
                placeholder="Role title"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <input
                className="w-24 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
                type="number"
                placeholder="Points"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
              <input
                className="w-24 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
                type="number"
                placeholder="Headcount"
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value)}
              />

                <Button type="button" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleAddRole}>
                  Add
                </Button>
              </div>
            </div>

            {/* Role List */}
            {eventData.roles.length > 0 && (
              <ul className="space-y-3 mt-4">
                {eventData.roles.map((r, index) => (
                  <li key={index} className="flex justify-between p-3 border rounded-lg bg-white">
                    <span className="font-medium text-gray-800">
                      {r.role} - {r.points} pts | {r.headcount} needed
                    </span>
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1" onClick={() => handleDeleteRole(index)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {/* Form Buttons */}
            <div className="flex space-x-4 mt-6">
              <Button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 flex-1" onClick={() => router.push("/events")}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                Create Event
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
