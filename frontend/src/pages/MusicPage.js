import React from 'react';
import { FiMusic, FiTrendingUp, FiHeart, FiBarChart2, FiZap, FiAward } from 'react-icons/fi';
import SpotifyConnect from '../components/SpotifyConnect';

const MusicPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Music World</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A snapshot into my music taste and what I've been listening to lately.
          </p>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-3 mr-4">
                <FiMusic className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Music Platform</p>
                <p className="text-2xl font-bold text-gray-900">Spotify</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-3 mr-4">
                <FiTrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Top Tracks</p>
                <p className="text-2xl font-bold text-gray-900">20+</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-3 mr-4">
                <FiHeart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Artists</p>
                <p className="text-2xl font-bold text-gray-900">Diverse</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-full p-3 mr-4">
                <FiBarChart2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Analytics</p>
                <p className="text-2xl font-bold text-gray-900">Live</p>
              </div>
            </div>
          </div>
        </div>

        {/* Spotify Dashboard */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <FiAward className="mr-3 h-8 w-8 text-green-500" />
              My Spotify Dashboard
            </h2>
            <div className="text-sm text-gray-500 bg-green-100 px-3 py-1 rounded-full">
              Live from my Spotify
            </div>
          </div>
          <SpotifyConnect />
        </div>

        {/* More Music Features Coming Soon */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiZap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">More Music Features Coming Soon</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              I'm working on adding playlist analysis, mood tracking, and music recommendations to share my musical journey with you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPage; 