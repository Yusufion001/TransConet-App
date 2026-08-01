const { createClient } = require('@supabase/supabase-js');
try {
  const supabase = createClient('https://placeholder.supabase.co', 'placeholder_key');
  console.log("Success!");
} catch (e) {
  console.log("Failed:", e.message);
}
