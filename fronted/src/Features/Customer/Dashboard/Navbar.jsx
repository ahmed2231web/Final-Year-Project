import { FaShoppingCart } from 'react-icons/fa';
import Searchbar from '../../../ui/Searchbar';

function Navbar({ cartItemsCount, toggleCart, searchTerm, setSearchTerm }) {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Searchbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Search"
          />
          
          <div className="flex items-center">
            <button 
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
              aria-label="Shopping cart"
            >
              <FaShoppingCart className="text-xl" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;