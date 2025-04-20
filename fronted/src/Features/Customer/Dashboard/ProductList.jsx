import { FaLeaf, FaStar, FaShoppingCart, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';

/**
 * ProductList Component
 * Displays a grid of product cards with details and add to cart functionality
 */
function ProductList({ products }) {
  const { addToCart } = useCart();
  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-10">
        <h2 className="text-2xl font-semibold text-gray-700">No products found</h2>
        <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  // Function to calculate discounted price
  const calculateDiscountedPrice = (price, discount) => {
    if (!discount) return price;
    return price - (price * (discount / 100));
  };

  return (
    <>
      {products.map(product => (
        <div 
          key={product.id} 
          className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
        >
          {/* Product Image with Link */}
          <Link to={`/products/${product.id}`} className="relative block">
            <img 
              src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
              alt={product.productName} 
              className="w-full h-56 object-cover"
              loading="lazy"
            />
            {/* Organic Badge - assuming category can indicate organic */}
            {product.category === 'organic' && (
              <div className="absolute top-2 left-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                <FaLeaf className="mr-1" /> Organic
              </div>
            )}
            {/* Price Badge */}
            <div className="absolute top-2 right-2 bg-white text-green-600 px-3 py-1 rounded-full text-sm font-bold shadow-md">
              ${parseFloat(product.price).toFixed(2)}
            </div>
            
            {/* Discount Badge */}
            {product.discount > 0 && (
              <div className="absolute top-12 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md animate-pulse">
                {product.discount}% OFF
              </div>
            )}
          </Link>
          
          {/* Product Details */}
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <Link to={`/products/${product.id}`} className="hover:text-green-600 transition-colors">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.productName}</h3>
              </Link>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              
              {/* Farmer Info with City */}
              <div className="flex flex-col mb-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">Farmer: </span>
                  <span className="text-sm font-medium ml-1 text-green-700">{product.farmer_name}</span>
                </div>
                <div className="flex items-center mt-1">
                  <FaMapMarkerAlt className="text-gray-400 mr-1 text-xs" />
                  <span className="text-xs text-gray-500">{product.farmer_city}</span>
                </div>
              </div>
              
              {/* Price with discount if applicable */}
              <div className="flex items-center mb-4">
                {product.discount > 0 ? (
                  <>
                    <span className="text-lg font-bold text-green-600">
                      ${calculateDiscountedPrice(product.price, product.discount).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-green-600">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                )}
              </div>
              
              {/* Stock Status */}
              <div className="flex items-center mb-4">
                <span className={`text-sm ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'} font-medium`}>
                  {product.stockQuantity > 0 
                    ? product.stockQuantity > 10 
                      ? 'In Stock' 
                      : 'Limited Stock' 
                    : 'Out of Stock'}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-2">
              {/* View Details Button */}
              <Link 
                to={`/products/${product.id}`}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium flex items-center justify-center"
              >
                <FaInfoCircle className="mr-2" />
                Details
              </Link>
              
              {/* Add to Cart Button */}
              <button 
                onClick={() => addToCart(product)}
                disabled={product.stockQuantity <= 0}
                className={`flex-1 px-4 py-2 rounded-md transition-colors font-medium flex items-center justify-center
                  ${product.stockQuantity > 0 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'}`}
              >
                <FaShoppingCart className="mr-2" />
                {product.stockQuantity > 0 ? 'Add' : 'Out'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default ProductList;