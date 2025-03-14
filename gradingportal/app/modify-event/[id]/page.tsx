"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/Button";

interface Role {
  role: string;
  points: number;
  teacherID: string[];
}

interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  description: string;
  roles: Role[];
}

interface Teacher {
  TeacherID: string;
  name: string;
}

const ModifyEventPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [eventData, setEventData] = useState<Event | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    fetchEventDetails();
    fetchTeachers();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get<Event>(`http://localhost:8081/events/${id}`);
      setEventData(response.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get<Teacher[]>("http://localhost:8081/teachers");
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (eventData) {
      setEventData({ ...eventData, [e.target.name]: e.target.value });
    }
  };

  const handleAssignTeacher = (roleIndex: number, teacher: string) => {
    if (eventData) {
      const updatedRoles = [...eventData.roles];
      if (!updatedRoles[roleIndex].teachers.includes(teacher)) {
        updatedRoles[roleIndex].teachers.push(teacher);
        setEventData({ ...eventData, roles: updatedRoles });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8081/events/${id}`, eventData);
      alert("Event updated successfully!");
      router.push("/events");
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  if (!eventData) return <p className="text-center text-lg text-gray-800">Loading event details...</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-100 shadow-lg rounded-lg border">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">Modify Event</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-semibold text-gray-900">Event Name</label>
          <input
            className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            name="name"
            value={eventData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-semibold text-gray-900">Date</label>
            <input
              className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              type="date"
              name="date"
              value={eventData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-900">Time</label>
            <input
              className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              type="time"
              name="time"
              value={eventData.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900">Description</label>
          <textarea
            className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            name="description"
            value={eventData.description}
            onChange={handleChange}
            required
          />
        </div>

        <h2 className="text-2xl font-semibold mt-6 mb-4 text-black">Assign Teachers to Roles</h2>
        <ul className="space-y-4">
          {eventData.roles.map((role, index) => (
            <li
              key={`${role.role}-${index}`}
              className="flex flex-col p-4 border rounded-lg bg-white"
            >
              <span className="text-lg font-semibold text-gray-900">
                {role.role} ({role.points} pts)
              </span>
              <select
                className="border p-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                onChange={(e) => handleAssignTeacher(index, e.target.value)}
              >
                <option value="" className="text-gray-700">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option
                    key={teacher.id}
                    value={teacher.name}
                    className="text-gray-900"
                    disabled={role.teachers.includes(teacher.name)}
                  >
                    {teacher.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-gray-700">
                Assigned: {role.teachers.length > 0 ? role.teachers.join(", ") : "None"}
              </p>
              <ul>
                {role.teachers.map((teacher) => (
                  <li key={teacher} className="text-gray-700">{teacher}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 rounded-lg font-semibold"
        >
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default ModifyEventPage;
