import React, { useState, useEffect } from "react";
import { FiAward, FiClock, FiMapPin, FiCalendar, FiTrendingUp, FiPlus, FiEdit, FiTrash2, FiSearch, FiSave, FiX } from "react-icons/fi";
import { raceAPI } from "../services/raceAPI";

const RacesAdminPage = () => {
  const [races, setRaces] = useState([]);
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedDistance, setSelectedDistance] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRace, setEditingRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const raceTypes = [
    { id: "running", name: "Running", color: "blue" },
    { id: "cycling", name: "Cycling", color: "green" },
    { id: "triathlon", name: "Triathlon", color: "purple" },
    { id: "swimming", name: "Swimming", color: "cyan" },
    { id: "other", name: "Other", color: "gray" }
  ];

  const distances = [
    { id: "5k", name: "5K" },
    { id: "10k", name: "10K" },
    { id: "half-marathon", name: "Half Marathon" },
    { id: "marathon", name: "Marathon" },
    { id: "ultra", name: "Ultra" },
    { id: "other", name: "Other" }
  ];

  useEffect(() => {
    loadRaces();
  }, []);

  const loadRaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const racesData = await raceAPI.getRaces();
      setRaces(racesData);
    } catch (err) {
      console.error('Error loading races:', err);
      setError('Failed to load races. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = races;
    
    if (searchTerm) {
      filtered = filtered.filter(race => 
        race.raceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (race.location && race.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (race.notes && race.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedYear !== "all") {
      filtered = filtered.filter(race => race.year === parseInt(selectedYear));
    }
    
    if (selectedDistance !== "all") {
      filtered = filtered.filter(race => race.distance === selectedDistance);
    }
    
    setFilteredRaces(filtered);
  }, [races, searchTerm, selectedYear, selectedDistance]);

  const handleAddRace = async (e) => {
    e.preventDefault();
    if (!newRace.raceName || !newRace.date) return;
    
    try {
      const race = await raceAPI.createRace(newRace);
      setRaces(prev => [race, ...prev]);
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
    } catch (error) {
      console.error('Error creating race:', error);
      setError('Failed to create race. Please try again.');
    }
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

  const handleUpdateRace = async (e) => {
    e.preventDefault();
    if (!newRace.raceName || !newRace.date) return;
    
    try {
      const updatedRace = await raceAPI.updateRace(editingRace.id, newRace);
      setRaces(prev => prev.map(race => 
        race.id === editingRace.id ? updatedRace : race
      ));
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
    } catch (error) {
      console.error('Error updating race:', error);
      setError('Failed to update race. Please try again.');
    }
  };

  const handleDeleteRace = async (id) => {
    if (window.confirm("Are you sure you want to delete this race?")) {
      try {
        await raceAPI.deleteRace(id);
        setRaces(prev => prev.filter(race => race.id !== id));
      } catch (error) {
        console.error('Error deleting race:', error);
        setError('Failed to delete race. Please try again.');
      }
    }
  };

  const cancelForm = () => {
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

  const getYears = () => {
    const years = [...new Set(races.map(race => race.year))].sort((a, b) => b - a);
    return years;
  };

  const getTotalRaces = () => races.length;
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
      const placement = parseInt(race.placement.replace(/\D/g, ''));
      return placement <= 3;
    }).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading races...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Race Management</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your race history and athletic achievements
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button onClick={() => setError(null)} className="float-right font-bold"></button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-full p-3 mr-4">
                <FiAward className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Races</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalRaces()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-3 mr-4">
                <FiTrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalDistance()} km</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-3 mr-4">
                <FiClock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Best Marathon</p>
                <p className="text-2xl font-bold text-gray-900">{getBestTime()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-3 mr-4">
                <FiAward className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Podiums</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalPodiums()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search races..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                {getYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={selectedDistance}
                onChange={(e) => setSelectedDistance(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Distances</option>
                {distances.map(distance => (
                  <option key={distance.id} value={distance.id}>{distance.name}</option>
                ))}
              </select>

              <button
                onClick={() => setShowAddForm(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center"
              >
                <FiPlus className="h-4 w-4 mr-2" />
                Add Race
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Race Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingRace ? "Edit Race" : "Add New Race"}
                  </h2>
                  <button
                    onClick={cancelForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={editingRace ? handleUpdateRace : handleAddRace} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Race Name *</label>
                      <input
                        type="text"
                        value={newRace.raceName}
                        onChange={(e) => setNewRace({...newRace, raceName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                      <input
                        type="date"
                        value={newRace.date}
                        onChange={(e) => setNewRace({...newRace, date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={newRace.location}
                        onChange={(e) => setNewRace({...newRace, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
                      <select
                        value={newRace.distance}
                        onChange={(e) => setNewRace({...newRace, distance: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {distances.map(distance => (
                          <option key={distance.id} value={distance.id}>{distance.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        type="text"
                        value={newRace.time}
                        onChange={(e) => setNewRace({...newRace, time: e.target.value})}
                        placeholder="e.g., 3:45:23"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Placement</label>
                      <input
                        type="text"
                        value={newRace.placement}
                        onChange={(e) => setNewRace({...newRace, placement: e.target.value})}
                        placeholder="e.g., 1,234th"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Race Type</label>
                    <select
                      value={newRace.raceType}
                      onChange={(e) => setNewRace({...newRace, raceType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {raceTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={newRace.notes}
                      onChange={(e) => setNewRace({...newRace, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={cancelForm}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
                    >
                      <FiSave className="h-4 w-4 mr-2" />
                      {editingRace ? "Update Race" : "Add Race"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Races Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaces.map(race => (
            <div key={race.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                    <FiAward className="h-4 w-4 mr-1" />
                    {race.raceType.charAt(0).toUpperCase() + race.raceType.slice(1)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRace(race)}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRace(race.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {race.raceName}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <FiCalendar className="h-4 w-4 mr-2" />
                    <span>{new Date(race.date).toLocaleDateString()}</span>
                  </div>
                  {race.location && (
                    <div className="flex items-center text-gray-600">
                      <FiMapPin className="h-4 w-4 mr-2" />
                      <span>{race.location}</span>
                    </div>
                  )}
                  {race.time && (
                    <div className="flex items-center text-gray-600">
                      <FiClock className="h-4 w-4 mr-2" />
                      <span>{race.time}</span>
                    </div>
                  )}
                  {race.placement && (
                    <div className="flex items-center text-gray-600">
                      <FiAward className="h-4 w-4 mr-2" />
                      <span>{race.placement}</span>
                    </div>
                  )}
                </div>

                {race.notes && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {race.notes}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                    {race.distance.charAt(0).toUpperCase() + race.distance.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {race.year}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRaces.length === 0 && (
          <div className="text-center py-12">
            <FiAward className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No races found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedYear !== "all" || selectedDistance !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start building your race history by adding your first race."
              }
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center mx-auto"
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Add Your First Race
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RacesAdminPage;
