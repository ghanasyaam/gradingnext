"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/Card";
import { CardContent } from "@/components/ui/CardContent";
import { Button } from "@/components/ui/Button";

interface Role {
  role: string;
  points: string;
  teachers: string[];
}

interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  description: string;
  roles?: Role[];
}

const EventPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchEvents = async () => {
    try {
      const response = await axios.get<Event[]>("http://localhost:8081/events");
      console.log("Raw API response:", response.data);

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format: Expected an array.");
      }

      response.data.forEach((event, index) => {
        console.log(`Event ${index}:`, event);
      });

      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Upcoming Events</h1>
          <div className="w-24 h-1 bg-blue-600 rounded-full mb-8"></div>
          
          <Button
            onClick={() => router.push("/create-event")}
            className="px-6 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Event
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-xl font-medium text-blue-700">Loading events...</span>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <div
                key={event.id ?? `${event.name}-${index}`}
                onClick={() => {
                  if (event.id && typeof event.id === "number") {
                    router.push(`/modify-event/${event.id}`);
                  } else {
                    console.error("Event ID is missing or invalid", event);
                    alert("This event cannot be modified due to missing ID.");
                  }
                }}
                className="transform transition-all duration-300 hover:-translate-y-2"
              >
                <Card className="h-full bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl border border-gray-100">
                  <div className="bg-blue-600 h-2"></div>
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-bold text-gray-900 leading-tight">{event.name}</h2>
                      <div className="flex items-center justify-center rounded-full bg-blue-100 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-4 text-sm font-medium text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{event.date}</span>
                      <span className="mx-2">•</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{event.time}</span>
                    </div>
                    
                    <div className="mb-6 flex-grow">
                      <p className="text-gray-600 leading-relaxed">{event.description}</p>
                    </div>
                    
                    {event.roles && event.roles.length > 0 && (
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Roles:
                        </h3>
                        <div className="space-y-2">
                          {event.roles.map((role, roleIndex) => (
                            <div key={roleIndex} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                              <span className="font-medium text-gray-800">{role.role}</span>
                              <div className="flex items-center">
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                                  {role.points} pts
                                </span>
                                <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                  {(role.teachers || []).length} teacher{(role.teachers || []).length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-xl p-12 text-center max-w-lg mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xl font-medium text-gray-600 mb-2">No events available</p>
            <p className="text-gray-500 mb-6">There are no upcoming events scheduled at the moment.</p>
            <Button
              onClick={() => router.push("/create-event")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Create your first event
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPage;