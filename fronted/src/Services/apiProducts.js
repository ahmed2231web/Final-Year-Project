import supabase from "./supabase";

export async function createEditProduct(product,id) {
  
  // Create/Edit Product
  let query= supabase.from("products");

  // 1) Create 
  if(!id)
   query= query
  .insert([
  product
])
  // 2) Edit
  if(id)
   query= query.update(product)
  .eq('id', id)

const {data,error} = await query.select();

    if (error) {
      console.error("Error inserting data:", error);
      throw new Error(error.message || "Product not added successfully");
    }
  
    return data;
  }

  export async function getProduct() {
    const { data: products, error } = await supabase
      .from('products')
      .select('*');
  
    if (error) {
      console.error('Error fetching products:', error);
      throw new Error("Products could not be loaded")
    }
  
    return products;
  }

  export async function deleteProduct(productId) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId); // Deletes the product where the id matches
  
    if (error) {
      console.error("Error deleting product:", error);
      throw new Error(error.message || "Product could not be deleted");
    }
    
  }
  