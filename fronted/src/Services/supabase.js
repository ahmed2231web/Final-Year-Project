import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://tzlmshyatspllyuivyfn.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6bG1zaHlhdHNwbGx5dWl2eWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzMjEyMTMsImV4cCI6MjA1MTg5NzIxM30.apG2WCQ1lou7BjNcA4QvWPJAfFf7eLvUqxlVQZt-gsU"
const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase;