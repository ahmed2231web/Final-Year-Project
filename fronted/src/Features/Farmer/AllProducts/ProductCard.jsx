import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import AddProductForm from "./AddProductForm";

function ProductCard({ product, onEdit, onDelete }) {
   const [showForm,setShowForm] = useState(false);
  return (
    <>
    <div className="bg-white rounded-xl shadow-lg p-5 transition-all duration-300 hover:shadow-xl border border-gray-200 hover:border-green-400 max-w-[350px] flex flex-col">
      {/* Product Image */}
      <img
        src={product.imageUrl}
        alt={product.productName}
        className="w-full h-56 object-cover rounded-lg"
      />

      {/* Product Details + Stock Badge in Flex */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">{product.productName}</h3>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md ${
              product.stock > 0 ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>
        <p className="text-gray-600 text-sm">{product.category}</p>
        <p className="text-gray-700 text-sm line-clamp-2">{product.description}</p>
      </div>

      {/* Price & Actions */}
      <div className="mt-4 flex justify-between items-center">
        <span className="text-lg font-bold text-green-600">${product.price}/kg</span>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm((show)=>!show)}
            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
    {showForm && <AddProductForm productToEdit={product}/>}
    </>
  );
}

export default ProductCard;
