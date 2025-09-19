import React, { useState, useEffect } from 'react';
import { FiMusic, FiTrendingUp, FiClock, FiHeart, FiZap, FiUser, FiPlay } from 'react-icons/fi';

const SpotifyConnect = () => {
  const [spotifyData, setSpotifyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpotifyData();
  }, []);

  const fetchSpotifyData = async () => {
    try {
      setLoading(true);
      const [profileResponse, topTracksResponse, recentlyPlayedResponse] = await Promise.all([
        fetch('http://localhost:8000/api/spotify/profile'),
        fetch('http://localhost:8000/api/spotify/top-tracks'),
        fetch('http://localhost:8000/api/spotify/recently-played')
      ]);

      console.log('Profile response status:', profileResponse.status, profileResponse.ok);
      console.log('Top tracks response status:', topTracksResponse.status, topTracksResponse.ok);
      console.log('Recently played response status:', recentlyPlayedResponse.status, recentlyPlayedResponse.ok);
      
      if (profileResponse.ok && topTracksResponse.ok && recentlyPlayedResponse.ok) {
        const profile = await profileResponse.json();
        const topTracks = await topTracksResponse.json();
        const recentlyPlayed = await recentlyPlayedResponse.json();
        setSpotifyData({ profile, topTracks, recentlyPlayed });
      } else {
        setError('Unable to load Spotify data');
      }
    } catch (err) {
      setError('Failed to connect to Spotify');
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

  if (error || !spotifyData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <FiMusic className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">My Spotify Data</h3>
          <p className="text-gray-500 mb-4">Currently updating my music dashboard...</p>
          <button
            onClick={fetchSpotifyData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FiZap className="mr-2 h-4 w-4" />
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  const { profile, topTracks, recentlyPlayed } = spotifyData;

  const formatDuration = (ms) => {
    if (!ms || ms === 0) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTrackPopularityColor = (popularity) => {
    if (popularity >= 80) return 'text-green-600';
    if (popularity >= 60) return 'text-yellow-600';
    if (popularity >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrackPopularityIcon = (popularity) => {
    if (popularity >= 80) return '🔥';
    if (popularity >= 60) return '⭐';
    if (popularity >= 40) return '👍';
    return '💫';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <FiMusic className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Maya's Spotify Dashboard</h2>
              <p className="text-green-100 text-sm">My personal music taste</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white text-sm">Connected as</p>
            <p className="text-white font-semibold">{profile.display_name}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-full p-2 mr-3">
                <FiUser className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Profile</p>
                <p className="text-2xl font-bold text-green-900">{profile.display_name}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-full p-2 mr-3">
                <FiTrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Top Tracks</p>
                <p className="text-2xl font-bold text-blue-900">{topTracks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center">
              <div className="bg-purple-500 rounded-full p-2 mr-3">
                <FiClock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Recently Played</p>
                <p className="text-2xl font-bold text-purple-900">{recentlyPlayed.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Tracks */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiTrendingUp className="mr-2 h-5 w-5 text-green-500" />
            My Top Tracks
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topTracks.slice(0, 6).map((track, index) => (
              <div key={track.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-green-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={track.album?.images?.[0]?.url || '/default-album.jpg'} 
                      alt={track.album?.name || 'Album'} 
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{track.name}</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {track.artists?.map(artist => artist.name).join(', ')}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs font-medium ${getTrackPopularityColor(track.popularity)}`}>
                        {getTrackPopularityIcon(track.popularity)} {track.popularity}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDuration(track.duration_ms)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Played */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiClock className="mr-2 h-5 w-5 text-green-500" />
            Recently Played
          </h3>
          
          <div className="space-y-3">
            {recentlyPlayed.slice(0, 5).map((item) => (
              <div key={item.played_at} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-green-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={item.track?.album?.images?.[0]?.url || '/default-album.jpg'} 
                      alt={item.track?.album?.name || 'Album'} 
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{item.track?.name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.track?.artists?.map(artist => artist.name).join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {formatDate(item.played_at)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDuration(item.track?.duration_ms)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {recentlyPlayed.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FiMusic className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No recently played tracks found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotifyConnect; 
