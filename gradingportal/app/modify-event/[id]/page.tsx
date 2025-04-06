"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/Button";

interface Role {
  role: string;
  points: number;
  headcount: number;
  teachers: string[];
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
  department: string;
  position: string;
  profilePhoto: string; 
  points: number;
}


const ModifyEventPage = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [eventData, setEventData] = useState<Event | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) {
      console.warn("⚠️ No ID provided, skipping fetchEventDetails");
      return;
    }
    fetchEventDetails();
  }, [id]);
  
  useEffect(() => {
    fetchTeachers();
  }, []);
   

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      if (!id) throw new Error("No event ID provided.");
  
      const response = await axios.get<Event>(`http://localhost:8081/events/${id}`);
      if (!response.data) throw new Error("No event data received.");
  
      console.log("✅ Event Data:", response.data);
  
      const sanitizedRoles = response.data.roles.map(role => ({
        ...role,
        teachers: Array.isArray(role.teachers) ? role.teachers : [],
      }));
  
      setEventData({ ...response.data, roles: sanitizedRoles });
    } catch (error) {
      console.error("🚨 Error fetching event:", error);
      setEventData(null);
    } finally {
      setLoading(false);
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
    if (!eventData) return;
  
    setEventData((prevData) => ({
      ...prevData!,
      [e.target.name]: e.target.value || "",
    }));
  };  

  const setRole = (updatedRole: Role) => {
    setEventData((prevData) => {
      if (!prevData || !Array.isArray(prevData.roles)) return prevData;
  
      const updatedRoles = prevData.roles.map((role) =>
        role.role === updatedRole.role ? updatedRole : role
      );
  
      return { ...prevData, roles: updatedRoles };
    });
  };
    

  const handleRemoveTeacher = (roleName: string, teacherToRemove: string) => {
    setEventData((prevData) => {
      if (!prevData || !Array.isArray(prevData.roles)) return prevData;
  
      const updatedRoles = prevData.roles.map((role) =>
        role.role === roleName
          ? { ...role, teachers: role.teachers.filter((teacher) => teacher !== teacherToRemove) }
          : role
      );
  
      return { ...prevData, roles: updatedRoles };
    });
  };
  
  
  const handleAssignTeacher = (roleIndex: number, teacher: string) => {
    if (!eventData || !teacher) return;
  
    setEventData(prevData => {
      if (!prevData) return null;
  
      const updatedRoles = [...prevData.roles];
      const currentRole = updatedRoles[roleIndex];
  
      const headcount = Number(currentRole.headcount) || 0;
  
      if (currentRole.teachers.length >= headcount) {
        alert(`Only ${headcount} teacher(s) allowed for the role "${currentRole.role}".`);
        return prevData;
      }
  
      if (!currentRole.teachers.includes(teacher)) { 
        currentRole.teachers = [...currentRole.teachers, teacher];
      }
  
      return { ...prevData, roles: updatedRoles };
    });
  };
  

  const handleAutoAssign = () => {
    if (!eventData) return;
  
    const updatedRoles = eventData.roles.map((role) => ({
      ...role,
      teachers: [],
    }));
  
    let availableTeachers = [...teachers];
  
    for (const role of updatedRoles) {
      let assignedTeachers: string[] = [];
  
      for (let i = 0; i < Number(role.headcount) && availableTeachers.length > 0; i++) {
        let minPointsTeacher = availableTeachers.reduce((prev, curr) => (prev.points < curr.points ? prev : curr));
  
        availableTeachers = availableTeachers.filter(teacher => teacher.TeacherID !== minPointsTeacher.TeacherID);
  
        assignedTeachers.push(minPointsTeacher.name);
      }
  
      role.teachers = assignedTeachers; 
    }
  
    setEventData((prev) => ({
      ...prev!,
      roles: updatedRoles,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventData) return;
  
    for (const role of eventData.roles) {
      const headcount = Number(role.headcount) || 0;
      if (role.teachers.length > headcount) {
        alert(`The role "${role.role}" exceeds the allowed headcount (${role.teachers.length}/${headcount}).`);
        return;
      }
    }
  
    try {
      await axios.put(`http://localhost:8081/events/${id}`, eventData, {
        headers: { "Content-Type": "application/json" },
      });
  
      alert("Event updated successfully!");
      router.push("/events");
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update the event. Please try again.");
    }
  };  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl font-medium text-blue-700">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-red-50 to-white">
        <div className="text-center p-8 max-w-md bg-white rounded-xl shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-medium text-red-700">Error loading event</p>
          <p className="mt-2 text-gray-600">Unable to retrieve event details. Please try again later.</p>
          <Button 
            className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            onClick={() => router.push("/events")}
          >
            Return to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-3xl font-bold text-white text-center">Modify Event</h1>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 uppercase tracking-wider">Event Name</label>
                <input
                  className="mt-1.5 w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all"
                  name="name"
                  value={eventData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 uppercase tracking-wider">Date</label>
                  <input
                    className="mt-1.5 w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all"
                    type="date"
                    name="date"
                    value={eventData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 uppercase tracking-wider">Time</label>
                  <input
                    className="mt-1.5 w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all"
                    type="time"
                    name="time"
                    value={eventData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-gray-700 uppercase tracking-wider">Description</label>
                <textarea
                  className="mt-1.5 w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all h-32"
                  name="description"
                  value={eventData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Assign Teachers to Roles
              </h2>
              <div className="space-y-4">
                {eventData.roles.map((role, index) => (
                  <div
                    key={`${role.role}-${index}`}
                    className="flex flex-col p-5 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {role.role}
                      <span className="ml-2 text-sm text-gray-500">
                        ({role.teachers.length}/{Number(role.headcount)})
                      </span>
                    </h3>

                      <span className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-full">
                        {role.points} pts
                      </span>
                    </div>
                    
                    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                      <div className="flex-1">
                      <select
                        className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        onChange={(e) => {
                          handleAssignTeacher(index, e.target.value);
                          e.target.selectedIndex = 0;
                        }}
                        disabled={role.teachers.length >= role.headcount}
                      >
                        <option value="">Select Teacher</option>
                        {teachers
                          .slice()
                          .sort((a, b) => a.points - b.points)
                          .map((teacher) => (
                            <option
                              key={teacher.TeacherID}
                              value={teacher.name}
                              disabled={role.teachers.includes(teacher.name)}
                            >
                              {teacher.name} {teacher.points > 0 && `(${teacher.points} pts)`}
                            </option>
                          ))}
                      </select>

                      <Button
                        type="button"
                        className="bg-green-600 hover:bg-green-700 text-white text-lg py-2 px-4 rounded-lg font-medium transition-colors"
                        onClick={handleAutoAssign}
                      >
                        Auto Assign Teachers
                      </Button>



                      </div>
                      
                      <div className="flex-1 border-t pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-4">
                        <div className="text-sm font-medium text-gray-500 mb-1.5">Current Assignments:</div>
                        {role.teachers.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {role.teachers.map((teacher, tIndex) => (
                              <span 
                                key={tIndex} 
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                              >
                                {teacher}
                                <button onClick={() => handleRemoveTeacher(role.role, teacher)}>  ✖</button>

                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm italic text-gray-500">No teachers assigned</p>
                        )}

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <div className="flex space-x-4">
                <Button
                  type="button"
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-lg py-3 rounded-lg font-medium"
                  onClick={() => router.push("/events")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


export default ModifyEventPage;