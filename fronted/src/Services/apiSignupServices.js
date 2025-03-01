import  supabase  from "./supabase";

export async function signup(user) {
  delete user.confirmPassword
  const { data, error } = await supabase
    .from('usersTemporaryTable')
    .insert([user]);

  if (error) {
    console.error("Error inserting data:", error);
    throw new Error(error.message || "User not added successfully");
  }

  return data;
}
