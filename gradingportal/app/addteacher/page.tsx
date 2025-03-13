'use client';

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface Teacher {
  id: number;
  name: string;
  department: string;
  position: string;
  profilePhoto: string;
}

const TeacherRegPage: React.FC = () => {
  const [formData, setFormData] = useState<Teacher>({
    id: 0,
    name: '',
    department: '',
    position: '',
    profilePhoto: '',
  });

  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const departments = [
    'Computer Science', 'Electronics & Communication', 'Mechanical Engineering',
    'Civil Engineering', 'Electrical Engineering', 'Mathematics', 'Physics', 'Chemistry'
  ];

  const positions = ['HOD', 'Professor', 'Associate Professor', 'Assistant Professor'];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get<Teacher[]>('http://localhost:8081/teachers');
      setTeachers(response.data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePhoto: reader.result as string }));
      };
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8081/teachers', formData);
      alert('Teacher added successfully!');
      setFormData({ id: 0, name: '', department: '', position: '', profilePhoto: '' });
      fetchTeachers();
    } catch (error) {
      console.error('Error adding teacher:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-5">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Teacher Registration Form</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-800">Faculty Name:</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border border-gray-400 rounded bg-gray-100 text-gray-900" />
              
              <label className="block font-medium text-gray-800 mt-2">Department:</label>
              <select name="department" value={formData.department} onChange={handleChange} required className="w-full p-2 border border-gray-400 rounded bg-gray-100 text-gray-900">
                <option value="">Select Department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>

              <label className="block font-medium text-gray-800 mt-2">Position:</label>
              <select name="position" value={formData.position} onChange={handleChange} required className="w-full p-2 border border-gray-400 rounded bg-gray-100 text-gray-900">
                <option value="">Select Position</option>
                {positions.map((pos, index) => (
                  <option key={index} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block font-medium text-gray-800">Profile Photo:</label>
              <div {...getRootProps()} className="border border-dashed border-gray-400 p-4 text-center cursor-pointer rounded bg-gray-100 text-gray-800">
                <input {...getInputProps()} />
                {isDragActive ? <p>Drop the image here...</p> : <p>Drag & drop or click to upload</p>}
              </div>
              {formData.profilePhoto && <img src={formData.profilePhoto} alt="Profile Preview" className="mt-2 w-20 h-20 rounded-full border border-gray-500" />}
            </div>
          </div>

          <div className="flex justify-between">
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-800">Save</button>
            <button type="reset" onClick={() => setFormData({ ...formData, profilePhoto: '' })} className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-800">Cancel</button>
          </div>
        </form>

        <h2 className="text-xl font-bold text-gray-900 mt-6">Registered Teachers</h2>
        <div className="teacher-list-container border border-gray-400 p-2 rounded mt-2 bg-gray-100 max-h-60 overflow-y-auto">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
  {teachers.map((teacher) => (
    <li key={teacher.id} className="flex items-center border border-gray-300 p-3 rounded bg-gray-200">
      {teacher.profilePhoto && <img src={teacher.profilePhoto} alt="Profile" className="w-12 h-12 rounded-full mr-3 border border-gray-500" />}
      <div className="text-gray-900">
        <strong>{teacher.name}</strong> - {teacher.department} ({teacher.position})
      </div>
    </li>
  ))}
</ul>

        </div>
      </div>
    </div>
  );
};

export default TeacherRegPage;
