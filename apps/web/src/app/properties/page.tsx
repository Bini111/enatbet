const mockProperties = [
  {
    id: 1,
    title: 'Luxury Beach Villa',
    location: 'Miami, USA',
    price: 250,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    beds: 3,
    baths: 2,
    rating: 4.8,
  },
  {
    id: 2,
    title: 'Modern City Apartment',
    location: 'New York, USA',
    price: 150,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    beds: 2,
    baths: 1,
    rating: 4.5,
  },
  {
    id: 3,
    title: 'Cozy Mountain Cabin',
    location: 'Colorado, USA',
    price: 180,
    image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800',
    beds: 2,
    baths: 1,
    rating: 4.9,
  },
];

export default function PropertiesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Available Properties</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProperties.map((property) => (
          <div key={property.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img 
              src={property.image} 
              alt={property.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
              <p className="text-gray-600 mb-2">{property.location}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">{property.beds} bed · {property.baths} bath</span>
                <span className="text-sm">⭐ {property.rating}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">${property.price}</span>
                <span className="text-gray-600">/ night</span>
              </div>
              <button className="w-full mt-4 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
