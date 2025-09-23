import React, { useState, useEffect } from 'react';
import { FiSearch, FiAward, FiClock, FiMapPin, FiCalendar } from 'react-icons/fi';

const RacesPage = () => {
  const [races, setRaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterDistance, setFilterDistance] = useState('');

  // Load races from localStorage
  useEffect(() => {
    const savedRaces = localStorage.getItem('races');
    if (savedRaces) {
      setRaces(JSON.parse(savedRaces));
    }
  }, []);

  // Filter races
  const filteredRaces = races.filter(race => {
    const matchesSearch = race.raceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         race.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = !filterYear || race.year.toString() === filterYear;
    const matchesDistance = !filterDistance || race.distance === filterDistance;
    return matchesSearch && matchesYear && matchesDistance;
  });

  // Get unique years and distances for filters
  const years = [...new Set(races.map(race => race.year))].sort((a, b) => b - a);
  const distances = [...new Set(races.map(race => race.distance).filter(Boolean))].sort();

  // Statistics
  const getTotalDistance = () => {
    const distanceMap = {
      "5k": 5,
      "10k": 10,
      "half-marathon": 21.1,
      "marathon": 42.2,
      "ultra": 50
    };
    return races.reduce((total, race) => {
      return total + (distanceMap[race.distance] || 0);
    }, 0).toFixed(1);
  };

  const getBestTime = () => {
    const marathonRaces = races.filter(race => race.distance === "marathon" && race.time);
    if (marathonRaces.length === 0) return "N/A";
    return marathonRaces.sort((a, b) => a.time.localeCompare(b.time))[0].time;
  };

  const getTotalPodiums = () => {
    return races.filter(race => {
      if (!race.placement) return false;
      const placement = parseInt(race.placement.replace(/\D/g, ''));
      return placement <= 3;
    }).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Race History</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            My athletic journey and race achievements
          </p>
        </div>

        {/* Stats Overview */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{races.length}</div>
            <div className="text-gray-600">Total Races</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search races..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={filterDistance}
                onChange={(e) => setFilterDistance(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Distances</option>
                {distances.map(distance => (
                  <option key={distance} value={distance}>{distance}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Races Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaces.map((race) => (
            <div key={race.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{race.raceName}</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <FiCalendar className="mr-2" />
                  {new Date(race.date).toLocaleDateString()}
                </div>
                {race.location && (
                  <div className="flex items-center text-gray-600">
                    <FiMapPin className="mr-2" />
                    {race.location}
                  </div>
                )}
                {race.time && (
                  <div className="flex items-center text-gray-600">
                    <FiClock className="mr-2" />
                    {race.time}
                  </div>
                )}
                {race.placement && (
                  <div className="flex items-center text-gray-600">
                    <FiAward className="mr-2" />
                    {race.placement}
                  </div>
                )}
                {race.distance && (
                  <div className="text-sm text-gray-500">
                    {race.distance.charAt(0).toUpperCase() + race.distance.slice(1)}
                  </div>
                )}
                {race.raceType && (
                  <div className="text-sm text-gray-500">
                    {race.raceType.charAt(0).toUpperCase() + race.raceType.slice(1)}
                  </div>
                )}
                {race.notes && (
                  <div className="text-sm text-gray-600 mt-2">
                    {race.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredRaces.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {races.length === 0 ? 'No races recorded yet.' : 'No races match your search criteria.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RacesPage;



