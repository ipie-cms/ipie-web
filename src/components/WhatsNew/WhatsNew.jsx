import React from 'react';
import Container from '../Container/Container';


const NewsCard = ({ category, date, title, description, image, categoryColor }) => (
  <Container>
  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
    <div className="h-48 overflow-hidden">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex justify-between items-center mb-3">
        <span className={`text-sm font-semibold ${categoryColor}`}>
          {category}
        </span>
        <span className="text-gray-500 text-sm">{date}</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 flex-grow">
        {description}
      </p>
      <a 
        href="#" 
        className="text-blue-700 font-semibold inline-flex items-center gap-2 hover:text-blue-900 transition-colors group"
      >
        Read More
        <svg 
          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </div>
  </Container>
);

const WhatsNew = () => {
  const newsItems = [
    {
      category: 'Announcement',
      categoryColor: 'text-blue-700',
      date: 'January 7, 2026',
      title: 'IPIE Platform 2.0 launched',
      description: 'New feature and enhanced user experience for all stakeholders.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop'
    },
    {
      category: 'Update',
      categoryColor: 'text-blue-600',
      date: 'January 7, 2026',
      title: 'Integration with e-courts',
      description: 'Seamless integration with e-courts for faster case processing.',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop'
    },
    {
      category: 'News',
      categoryColor: 'text-blue-700',
      date: 'January 7, 2026',
      title: 'National IBC Conference for 2024',
      description: 'Key highlights and outcomes from the national conference.',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop'
    },
    {
      category: 'Circular',
      categoryColor: 'text-blue-600',
      date: 'January 7, 2026',
      title: 'New Compliance Guidelines',
      description: 'Updated compliance guidelines for professionals for entities.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop'
    }
  ];

  return (
    <Container>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What's New
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Designed to simplify every stage of the IBC Ecosystem
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {newsItems.map((item, index) => (
            <NewsCard
              key={index}
              category={item.category}
              categoryColor={item.categoryColor}
              date={item.date}
              title={item.title}
              description={item.description}
              image={item.image}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button className="inline-flex items-center px-8 py-3 border-2 border-blue-700 text-blue-700 font-semibold rounded-lg hover:bg-blue-700 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            View all News
          </button>
        </div>

        {/* Restart Button */}
        {/* <div className="fixed bottom-6 right-6">
          <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Restart</span>
            <span className="text-gray-400 text-sm ml-1">R</span>
          </button>
        </div> */}
      </div>
    </div>
    </Container>
  );
};

export default WhatsNew;