import React, { useState, useEffect } from 'react';
import { FiActivity, FiTrendingUp, FiClock, FiMapPin, FiHeart, FiZap } from 'react-icons/fi';

const StravaConnect = () => {
  const [stravaData, setStravaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStravaData();
  }, []);

  const fetchStravaData = async () => {
    try {
      setLoading(true);
      const [athleteResponse, activitiesResponse] = await Promise.all([
        fetch('http://localhost:8000/api/strava/athlete'),
        fetch('http://localhost:8000/api/strava/activities?per_page=10')
      ]);

      console.log('Athlete response status:', athleteResponse.status, athleteResponse.ok);
      console.log('Activities response status:', activitiesResponse.status, activitiesResponse.ok);
      
      if (athleteResponse.ok && activitiesResponse.ok) {
        const athlete = await athleteResponse.json();
        const activities = await activitiesResponse.json();
        setStravaData({ athlete, activities });
      } else {
        console.log('Athlete response error:', athleteResponse.status, await athleteResponse.text());
        console.log('Activities response error:', activitiesResponse.status, await activitiesResponse.text());
        setError('Unable to load Strava data');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to connect to Strava');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stravaData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <FiActivity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">My Strava Data</h3>
          <p className="text-gray-500 mb-4">Currently updating my fitness dashboard...</p>
          <button
            onClick={fetchStravaData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <FiZap className="mr-2 h-4 w-4" />
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  const { athlete, activities } = stravaData;

  // Calculate summary stats
  const totalDistance = activities.reduce((sum, activity) => sum + (activity.distance || 0), 0);
  const totalTime = activities.reduce((sum, activity) => sum + (activity.moving_time || 0), 0);
  const totalActivities = activities.length;

  const formatDistance = (meters) => {
    if (!meters || meters === 0) return '0 km';
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      'Run': 'bg-blue-100 text-blue-800',
      'Ride': 'bg-green-100 text-green-800',
      'Walk': 'bg-purple-100 text-purple-800',
      'Swim': 'bg-cyan-100 text-cyan-800',
      'Workout': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getActivityTypeIcon = (type) => {
    const icons = {
      'Run': '🏃‍♀️',
      'Ride': '🚴‍♀️',
      'Walk': '🚶‍♀️',
      'Swim': '🏊‍♀️',
      'Workout': '💪'
    };
    return icons[type] || '🏃‍♀️';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <FiActivity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Maya's Strava Dashboard</h2>
              <p className="text-orange-100 text-sm">My personal fitness journey</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white text-sm">Connected as</p>
            <p className="text-white font-semibold">{athlete.firstname} {athlete.lastname}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-full p-2 mr-3">
                <FiTrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Total Distance</p>
                <p className="text-2xl font-bold text-blue-900">{formatDistance(totalDistance)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-full p-2 mr-3">
                <FiClock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Total Time</p>
                <p className="text-2xl font-bold text-green-900">{formatDuration(totalTime)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center">
              <div className="bg-purple-500 rounded-full p-2 mr-3">
                <FiHeart className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Activities</p>
                <p className="text-2xl font-bold text-purple-900">{totalActivities}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiActivity className="mr-2 h-5 w-5 text-orange-500" />
            My Recent Activities
          </h3>
          
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-orange-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getActivityTypeIcon(activity.type)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{activity.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <FiMapPin className="mr-1 h-3 w-3" />
                          {activity.type}
                        </span>
                        <span>{formatDate(activity.start_date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatDistance(activity.distance)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDuration(activity.moving_time)}
                    </div>
                  </div>
                </div>
                
                {activity.total_elevation_gain > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Elevation: {activity.total_elevation_gain.toFixed(0)}m
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FiActivity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No recent activities found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StravaConnect; 
