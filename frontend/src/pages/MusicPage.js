import React from 'react';
import { FiMusic, FiAward, FiZap } from 'react-icons/fi';
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

        {/* Centered Spotify Card */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-shadow max-w-md w-full">
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-4 mr-6">
                <FiMusic className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Music Platform</p>
                <p className="text-3xl font-bold text-gray-900">Spotify</p>
                <p className="text-sm text-green-600 font-medium mt-1">Connected & Live</p>
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
