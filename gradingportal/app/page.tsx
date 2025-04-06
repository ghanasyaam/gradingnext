'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import Link from 'next/link';
import Sidebar from '@/components/ui/sidebar';
import { Award, Users, Calendar, RefreshCcw } from 'lucide-react';

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
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchTeachers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<Teacher[]>('http://localhost:8081/teachers');
            let teachersData = response.data || [];
            
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
        } finally {
            setIsLoading(false);
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
        
        const gradientColors = teachers.map((_, index) => {
            const colors = [
                'rgba(99, 102, 241, 0.8)',
                'rgba(14, 165, 233, 0.8)',
                'rgba(249, 115, 22, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(234, 179, 8, 0.8)'
            ];
            return colors[index % colors.length];
        });
        
        chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: teachers.map(teacher => teacher.name),
                datasets: [{
                    label: 'Points',
                    data: teachers.map(teacher => teacher.points),
                    backgroundColor: gradientColors,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    barPercentage: 0.7,
                    categoryPercentage: 0.8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        displayColors: false
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        grid: { 
                            color: 'rgba(156, 163, 175, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            color: '#6B7280'
                        }
                    },
                    x: { 
                        grid: { 
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            color: '#6B7280'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [teachers]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar Component */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            {/* Main Content */}
            <div className="flex-1 transition-all duration-300 ease-in-out">
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Faculty Leaderboard</h1>
                        <button 
                            onClick={fetchTeachers}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md"
                        >
                            <RefreshCcw size={16} />
                            <span>Refresh</span>
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-xl p-6 flex items-center">
                            <div className="bg-indigo-100 p-4 rounded-lg mr-4">
                                <Award className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Total Points</h3>
                                <p className="text-2xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-xl p-6 flex items-center">
                            <div className="bg-blue-100 p-4 rounded-lg mr-4">
                                <Users className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Total Faculties</h3>
                                <p className="text-2xl font-bold text-gray-900">{totalFaculties}</p>
                            </div>
                        </div>
                        
                        <div className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-xl p-6 flex items-center">
                            <div className="bg-orange-100 p-4 rounded-lg mr-4">
                                <Calendar className="text-orange-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
                                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white shadow-md rounded-xl p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Faculty Performance</h2>
                        {isLoading ? (
                            <div className="h-96 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : teachers.length > 0 ? (
                            <div className="h-96">
                                <canvas ref={chartRef} className="w-full h-full"></canvas>
                            </div>
                        ) : (
                            <div className="h-96 flex items-center justify-center">
                                <p className="text-gray-500">No data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}