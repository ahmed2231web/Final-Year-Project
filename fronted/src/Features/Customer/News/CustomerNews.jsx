import React, { useState } from 'react';
import { FaCalendarAlt, FaUser, FaTag } from 'react-icons/fa';

// Sample news data
const sampleNews = [
  {
    id: 1,
    title: "New Organic Farming Techniques Boost Crop Yields",
    content: "Recent studies have shown that implementing new organic farming techniques can increase crop yields by up to 30% while maintaining soil health and biodiversity. These techniques focus on natural pest control, crop rotation, and sustainable water management.",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    author: "Dr. Sarah Johnson",
    date: "2025-03-10",
    category: "Farming Techniques",
    tags: ["organic", "sustainable", "farming"]
  },
  {
    id: 2,
    title: "Government Announces New Subsidies for Small-Scale Farmers",
    content: "The Ministry of Agriculture has announced a new subsidy program aimed at supporting small-scale farmers. The program will provide financial assistance for purchasing equipment, seeds, and implementing sustainable farming practices. Applications will open next month.",
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    author: "Ministry of Agriculture",
    date: "2025-03-05",
    category: "Government",
    tags: ["subsidies", "government", "support"]
  },
  {
    id: 3,
    title: "Climate Change Affecting Crop Patterns: What Farmers Need to Know",
    content: "Climate scientists have published new research on how changing weather patterns are affecting traditional crop growing seasons. The study provides recommendations for farmers on adapting their planting schedules and selecting more resilient crop varieties.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
    author: "Climate Research Institute",
    date: "2025-02-28",
    category: "Climate",
    tags: ["climate change", "adaptation", "crops"]
  },
  {
    id: 4,
    title: "New Mobile App Helps Farmers Connect Directly with Consumers",
    content: "A new mobile application has been launched to help farmers sell their produce directly to consumers, eliminating middlemen and increasing profits for farmers while providing fresher produce at better prices for consumers.",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    author: "Tech for Agriculture",
    date: "2025-02-20",
    category: "Technology",
    tags: ["app", "direct sales", "technology"]
  },
  {
    id: 5,
    title: "Sustainable Packaging Solutions for Agricultural Products",
    content: "Innovative biodegradable packaging solutions are being developed specifically for agricultural products. These eco-friendly alternatives help reduce plastic waste while maintaining product freshness and quality during transportation and storage.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    author: "Green Packaging Initiative",
    date: "2025-02-15",
    category: "Sustainability",
    tags: ["packaging", "sustainable", "eco-friendly"]
  }
];

/**
 * Customer News Component
 * Displays agricultural news articles for customers
 */
function CustomerNews() {
  const [news] = useState(sampleNews);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Get unique categories for filter
  const categories = ['all', ...new Set(news.map(item => item.category))];
  
  // Filter news by category
  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Agricultural News</h1>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-green-100'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        
        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map(item => (
            <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-48 object-cover"
              />
              
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <FaCalendarAlt className="mr-1" />
                  <span>{item.date}</span>
                  <span className="mx-2">•</span>
                  <FaUser className="mr-1" />
                  <span>{item.author}</span>
                </div>
                
                <h2 className="text-xl font-semibold mb-3 text-gray-800">{item.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{item.content}</p>
                
                <div className="flex items-center">
                  <FaTag className="text-gray-400 mr-2" />
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button className="mt-4 text-green-600 font-medium hover:text-green-700 transition-colors">
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomerNews;
