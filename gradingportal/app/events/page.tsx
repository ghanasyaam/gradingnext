"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/Card";
import { CardContent } from "@/components/ui/CardContent";
import { Button } from "@/components/ui/Button";

interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  description: string;
}

const EventPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch events from the backend
  const fetchEvents = async () => {
    try {
      const response = await axios.get<Event[]>("http://localhost:8081/events");
  
      console.log("Raw API response:", response.data); // Debugging line
  
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format: Expected an array.");
      }
  
      response.data.forEach((event, index) => {
        console.log(`Event ${index}:`, event); // Log each event
      });
  
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };
  

  // Load events when the page loads
  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Upcoming Events</h1>

      <Button
        onClick={() => router.push("/create-event")}
        className="mb-8 px-6 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105"
      >
        + Create Event
      </Button>

      {loading ? (
        <p className="text-gray-600 text-lg italic">Loading events...</p>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-7xl">
          {events.map((event, index) => (
            <div
              key={event.id ?? `${event.name}-${index}`}
              className="cursor-pointer transition-transform transform hover:scale-105"
              onClick={() => {
                if (event.id && typeof event.id === "number") { 
                  router.push(`/modify-event/${event.id}`);
                } else {
                  console.error("Event ID is missing or invalid", event);
                  alert("This event cannot be modified due to missing ID.");
                }
              }}
              
            >
              <Card className="bg-white shadow-xl rounded-lg overflow-hidden hover:shadow-2xl transition-transform transform hover:scale-105 cursor-pointer">
                <CardContent className="p-6 flex flex-col">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">{event.name}</h2>
                  <p className="text-gray-700 text-md mb-1"><strong>Date:</strong> {event.date}</p>
                  <p className="text-gray-700 text-md mb-3"><strong>Time:</strong> {event.time}</p>
                  <p className="text-gray-600 text-md leading-relaxed flex-grow">{event.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <p className="col-span-3 text-center text-gray-600 text-lg italic">
          No events available at the moment.
        </p>
      )}
    </div>
  );
};

export default EventPage;
