export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl">🇪🇹</span>
          <h1 className="text-5xl font-bold text-pink-600">ENATBET</h1>
          <span className="text-5xl">🇪🇷</span>
        </div>
        <p className="text-2xl text-gray-600 italic">
          "Book a home, not just a room"
        </p>
      </div>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-600 mb-6 leading-relaxed">
          Enatbet is a community-driven booking platform designed specifically for the 
          Ethiopian and Eritrean diaspora community, both at home and abroad. We connect 
          our brothers and sisters with authentic homes where they can experience true 
          hospitality and cultural connection.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900">Our Mission</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          To create a trusted platform where Ethiopians and Eritreans can share their homes 
          with fellow community members, offering more than just accommodation – offering a 
          piece of home, warmth, and cultural familiarity wherever you travel.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900">Why Enatbet?</h2>
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg mb-6">
          <p className="text-gray-700 leading-relaxed">
            <strong className="text-pink-600">Enat</strong> (እናት) means "mother" in Amharic – 
            representing the warmth, care, and nurturing spirit of our culture.
            <br /><br />
            <strong className="text-pink-600">Bet</strong> (ቤት) means "home" – a place of 
            belonging, safety, and community.
            <br /><br />
            Together, <strong className="text-pink-600">Enatbet</strong> embodies the motherly 
            love and warmth you'll find in every home on our platform.
          </p>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900">For Our Community</h2>
        <ul className="space-y-4 text-gray-700">
          <li className="flex items-start">
            <span className="text-2xl mr-3">🏡</span>
            <div>
              <strong>Diaspora Friendly:</strong> Find homes where you're understood, where 
              coffee ceremonies are familiar, and where injera is always on the menu.
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-2xl mr-3">🤝</span>
            <div>
              <strong>Community Trust:</strong> Book with confidence knowing you're staying 
              with fellow Ethiopians and Eritreans who share your values and culture.
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-2xl mr-3">🌍</span>
            <div>
              <strong>Global Network:</strong> Whether you're visiting Addis Ababa, Asmara, 
              or diaspora communities in North America, Europe, or the Middle East – find 
              your home away from home.
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-2xl mr-3">💚</span>
            <div>
              <strong>Cultural Connection:</strong> More than accommodation – experience 
              authentic hospitality, traditional meals, and meaningful connections.
            </div>
          </li>
        </ul>

        <div className="bg-gradient-to-r from-green-50 via-yellow-50 to-red-50 p-8 rounded-lg mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
          <p className="text-gray-700 mb-6">
            Whether you're hosting or traveling, Enatbet welcomes you home.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/signup" className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700">
              List Your Home
            </a>
            <a href="/properties" className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900">
              Find a Stay
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
