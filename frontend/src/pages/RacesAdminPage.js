import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSearch, FiAward, FiClock, FiMapPin, FiCalendar } from 'react-icons/fi';
import toast from "react-hot-toast";

const RacesAdminPage = () => {
  const [races, setRaces] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRace, setEditingRace] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [newRace, setNewRace] = useState({
    raceName: "",
    date: "",
    location: "",
    time: "",
    placement: "",
    distance: "",
    raceType: "running",
    notes: ""
  });

  // Load races from localStorage
  useEffect(() => {
    const savedRaces = localStorage.getItem('races');
    if (savedRaces) {
      setRaces(JSON.parse(savedRaces));
    }
  }, []);

  // Save races to localStorage
  const saveRaces = (updatedRaces) => {
    localStorage.setItem('races', JSON.stringify(updatedRaces));
    setRaces(updatedRaces);
  };

  const handleAddRace = (e) => {
    e.preventDefault();
    if (!newRace.raceName || !newRace.date) return;

    const race = {
      id: Date.now(),
      ...newRace,
      year: new Date(newRace.date).getFullYear()
    };

    const updatedRaces = [race, ...races];
    saveRaces(updatedRaces);
    
    setNewRace({
      raceName: "",
      date: "",
      location: "",
      time: "",
      placement: "",
      distance: "",
      raceType: "running",
      notes: ""
    });
    setShowAddForm(false);
    toast.success('Race saved successfully!');
    setSuccessMessage('Race saved successfully!');
  };

  const handleEditRace = (race) => {
    setEditingRace(race);
    setNewRace({
      raceName: race.raceName,
      date: race.date,
      location: race.location || "",
      time: race.time || "",
      placement: race.placement || "",
      distance: race.distance || "",
      raceType: race.raceType || "running",
      notes: race.notes || ""
    });
    setShowAddForm(true);
  };

  const handleUpdateRace = (e) => {
    e.preventDefault();
    if (!newRace.raceName || !newRace.date) return;

    const updatedRaces = races.map(race =>
      race.id === editingRace.id
        ? {
            ...race,
            ...newRace,
            year: new Date(newRace.date).getFullYear()
          }
        : race
    );

    saveRaces(updatedRaces);
    setNewRace({
      raceName: "",
      date: "",
      location: "",
      time: "",
      placement: "",
      distance: "",
      raceType: "running",
      notes: ""
    });
    setEditingRace(null);
    setShowAddForm(false);
    toast.success('Race updated successfully!');
    setSuccessMessage('Race updated successfully!');
  };

  const handleDeleteRace = (id) => {
    if (window.confirm('Are you sure you want to delete this race?')) {
      const updatedRaces = races.filter(race => race.id !== id);
      saveRaces(updatedRaces);
      toast.success('Race deleted successfully!');
      setSuccessMessage('Race deleted successfully!');
    }
  };

  const handleCancel = () => {
    setNewRace({
      raceName: "",
      date: "",
      location: "",
      time: "",
      placement: "",
      distance: "",
      raceType: "running",
      notes: ""
    });
    setEditingRace(null);
    setShowAddForm(false);
  };

  // Filter races
  const filteredRaces = races.filter(race => 
    race.raceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    race.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Race Management</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your race history and athletic achievements
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
            <button onClick={() => setSuccessMessage(null)} className="float-right font-bold"></button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{races.length}</div>
            <div className="text-gray-600">Total Races</div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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

        {/* Add Race Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <FiPlus className="text-xl" />
            Add New Race
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingRace ? 'Edit Race' : 'Add New Race'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={editingRace ? handleUpdateRace : handleAddRace} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Race Name *
                  </label>
                  <input
                    type="text"
                    value={newRace.raceName}
                    onChange={(e) => setNewRace({...newRace, raceName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newRace.date}
                    onChange={(e) => setNewRace({...newRace, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newRace.location}
                    onChange={(e) => setNewRace({...newRace, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="text"
                    value={newRace.time}
                    onChange={(e) => setNewRace({...newRace, time: e.target.value})}
                    placeholder="e.g., 3:45:30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placement
                  </label>
                  <input
                    type="text"
                    value={newRace.placement}
                    onChange={(e) => setNewRace({...newRace, placement: e.target.value})}
                    placeholder="e.g., 1st, 2nd, 15th"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance
                  </label>
                  <select
                    value={newRace.distance}
                    onChange={(e) => setNewRace({...newRace, distance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select Distance</option>
                    <option value="5k">5K</option>
                    <option value="10k">10K</option>
                    <option value="half-marathon">Half Marathon</option>
                    <option value="marathon">Marathon</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Race Type
                  </label>
                  <select
                    value={newRace.raceType}
                    onChange={(e) => setNewRace({...newRace, raceType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="running">Running</option>
                    <option value="cycling">Cycling</option>
                    <option value="triathlon">Triathlon</option>
                    <option value="swimming">Swimming</option>
                    <option value="hyrox">Hyrox</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newRace.notes}
                  onChange={(e) => setNewRace({...newRace, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Any additional notes about this race..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  {editingRace ? 'Update Race' : 'Add Race'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Races Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaces.map((race) => (
            <div key={race.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{race.raceName}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditRace(race)}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDeleteRace(race.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                </div>
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
              {races.length === 0 ? 'No races added yet. Click "Add New Race" to get started!' : 'No races match your search criteria.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RacesAdminPage;




