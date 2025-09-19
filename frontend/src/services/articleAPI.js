// API service for articles
const API_BASE_URL = 'http://localhost:8000/api/articles/enhanced';

export const articleAPI = {
  // Get all articles
  async getArticles() {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  },

  // Create a new article
  async createArticle(article) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      });
      if (!response.ok) {
        throw new Error('Failed to create article');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  },

  // Update an existing article
  async updateArticle(id, article) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      });
      if (!response.ok) {
        throw new Error('Failed to update article');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  },

  // Delete an article
  async deleteArticle(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete article');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  },

  // Get a specific article
  async getArticle(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching article:', error);
      throw error;
    }
  }
};
