// API service for races\nconst API_BASE_URL = ${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/races;

export const raceAPI = {
  // Get all races
  async getRaces() {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch races');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching races:', error);
      return [];
    }
  },

  // Create a new race
  async createRace(race) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(race),
      });
      if (!response.ok) {
        throw new Error('Failed to create race');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating race:', error);
      throw error;
    }
  },

  // Update an existing race
  async updateRace(id, race) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(race),
      });
      if (!response.ok) {
        throw new Error('Failed to update race');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating race:', error);
      throw error;
    }
  },

  // Delete a race
  async deleteRace(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete race');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting race:', error);
      throw error;
    }
  },

  // Get a specific race
  async getRace(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch race');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching race:', error);
      throw error;
    }
  }
};

