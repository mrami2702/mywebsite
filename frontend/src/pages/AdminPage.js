import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiExternalLink, FiCalendar, FiTag, FiBookOpen, FiSearch, FiHeart, FiClock } from "react-icons/fi";
import { articleAPI } from "../services/articleAPI";

const AdminPage = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newArticle, setNewArticle] = useState({
    title: "",
    url: "",
    description: "",
    category: "technology",
    tags: "",
    readTime: "",
    source: ""
  });

  const categories = [
    { id: "technology", name: "Technology", color: "purple" },
    { id: "environment", name: "Environment", color: "green" },
    { id: "psychology", name: "Psychology", color: "orange" },
    { id: "science", name: "Science", color: "blue" },
    { id: "business", name: "Business", color: "indigo" }
  ];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const articlesData = await articleAPI.getArticles();
      setArticles(articlesData);
    } catch (err) {
      console.error('Error loading articles:', err);
      setError('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = articles;
    
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.description && article.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    setFilteredArticles(filtered);
  }, [articles, searchTerm, selectedCategory]);

  const handleAddArticle = async (e) => {
    e.preventDefault();
    if (!newArticle.title || !newArticle.url) return;
    
    try {
      const article = await articleAPI.createArticle(newArticle);
      setArticles(prev => [article, ...prev]);
      setNewArticle({
        title: "",
        url: "",
        description: "",
        category: "technology",
        tags: "",
        readTime: "",
        source: ""
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating article:', error);
      setError('Failed to create article. Please try again.');
    }
  };

  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setNewArticle({
      title: article.title,
      url: article.url,
      description: article.description || "",
      category: article.category,
      tags: article.tags.join(", "),
      readTime: article.readTime || "",
      source: article.source || ""
    });
    setShowAddForm(true);
  };

  const handleUpdateArticle = async (e) => {
    e.preventDefault();
    if (!newArticle.title || !newArticle.url) return;
    
    try {
      const updatedArticle = await articleAPI.updateArticle(editingArticle.id, newArticle);
      setArticles(prev => prev.map(article => 
        article.id === editingArticle.id ? updatedArticle : article
      ));
      setNewArticle({
        title: "",
        url: "",
        description: "",
        category: "technology",
        tags: "",
        readTime: "",
        source: ""
      });
      setEditingArticle(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error updating article:', error);
      setError('Failed to update article. Please try again.');
    }
  };

  const handleDeleteArticle = async (id) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await articleAPI.deleteArticle(id);
        setArticles(prev => prev.filter(article => article.id !== id));
      } catch (error) {
        console.error('Error deleting article:', error);
        setError('Failed to delete article. Please try again.');
      }
    }
  };

  const cancelForm = () => {
    setNewArticle({
      title: "",
      url: "",
      description: "",
      category: "technology",
      tags: "",
      readTime: "",
      source: ""
    });
    setEditingArticle(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Management</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your curated article collection
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button onClick={() => setError(null)} className="float-right font-bold"></button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-3 mr-4">
                <FiBookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-3 mr-4">
                <FiClock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Read</p>
                <p className="text-2xl font-bold text-gray-900">{articles.filter(a => a.isRead).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-3 mr-4">
                <FiHeart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{articles.filter(a => a.isFavorite).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-full p-3 mr-4">
                <FiTag className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{new Set(articles.map(a => a.category)).size}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Articles
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center"
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Add Article
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingArticle ? "Edit Article" : "Add New Article"}
                  </h2>
                  <button
                    onClick={cancelForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={editingArticle ? handleUpdateArticle : handleAddArticle} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={newArticle.title}
                      onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
                    <input
                      type="url"
                      value={newArticle.url}
                      onChange={(e) => setNewArticle({...newArticle, url: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newArticle.description}
                      onChange={(e) => setNewArticle({...newArticle, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={newArticle.category}
                        onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Read Time</label>
                      <input
                        type="text"
                        value={newArticle.readTime}
                        onChange={(e) => setNewArticle({...newArticle, readTime: e.target.value})}
                        placeholder="e.g., 5 min read"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                      <input
                        type="text"
                        value={newArticle.source}
                        onChange={(e) => setNewArticle({...newArticle, source: e.target.value})}
                        placeholder="e.g., TechCrunch, Nature"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <input
                        type="text"
                        value={newArticle.tags}
                        onChange={(e) => setNewArticle({...newArticle, tags: e.target.value})}
                        placeholder="e.g., AI, Healthcare, Innovation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
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
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <FiSave className="h-4 w-4 mr-2" />
                      {editingArticle ? "Update Article" : "Add Article"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <div key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                    <FiBookOpen className="h-4 w-4 mr-1" />
                    {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditArticle(article)}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      <FiTag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <FiClock className="h-4 w-4 mr-1" />
                      {article.readTime || '5 min read'}
                    </span>
                    <span className="flex items-center">
                      <FiCalendar className="h-4 w-4 mr-1" />
                      {article.dateAdded}
                    </span>
                  </div>
                  {article.source && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {article.source}
                    </span>
                  )}
                </div>

                <div className="flex space-x-3">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <FiExternalLink className="h-4 w-4 mr-2" />
                    Read Article
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <FiBookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Start building your article collection by adding your first article."
              }
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center mx-auto"
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Add Your First Article
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
