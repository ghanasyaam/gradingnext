'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';

interface Teacher {
    id: number;
    name: string;
    department: string;
    position: string;
    profilePhoto: string;
    points: number;
}

export default function Leaderboard() {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const [totalPoints, setTotalPoints] = useState<number>(0);
    const [totalFaculties, setTotalFaculties] = useState<number>(0);
    const [totalEvents, setTotalEvents] = useState<number>(20);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    const fetchTeachers = async () => {
        try {
            const response = await axios.get<Teacher[]>('http://localhost:8081/teachers');
            let teachersData = response.data || [];
            console.log("Fetched Teachers:", teachersData); // Debugging: Log fetched data
    
            // Sort teachers by points in descending order
            teachersData.sort((a, b) => b.points - a.points);
    
            setTeachers(teachersData);
            setTotalFaculties(teachersData.length);
    
            let sum = teachersData.reduce((acc, teacher) => acc + (teacher.points || 0), 0);
            setTotalPoints(sum);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            setTeachers([]);
            setTotalPoints(0);
            setTotalFaculties(0);
        }
    };
    
    

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        if (!chartRef.current || teachers.length === 0) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: teachers.map(teacher => teacher.name),
                datasets: [{
                    label: 'Score',
                    data: teachers.map(teacher => teacher.points),
                    backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'],
                    borderColor: '#333',
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#ddd' }
                    },
                    x: {
                        grid: { color: '#ddd' }
                    }
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [teachers]); // Only run when teachers update

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>

            <div className="grid grid-cols-3 gap-6 w-full max-w-4xl">
                <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-700">Total Points</h3>
                    <p className="text-2xl font-bold text-blue-600">{totalPoints}</p>
                </div>
                <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-700">Total Faculties</h3>
                    <p className="text-2xl font-bold text-green-600">{totalFaculties}</p>
                </div>
                <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-700">Total Events</h3>
                    <p className="text-2xl font-bold text-red-600">{totalEvents}</p>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-4xl h-96 flex items-center justify-center">
                <canvas ref={chartRef} className="w-full h-full"></canvas>
            </div>
        </div>
    );
}
