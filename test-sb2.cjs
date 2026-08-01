const { createClient } = require('@supabase/supabase-js');
try {
  const supabase = createClient('invalid-url', 'placeholder_key');
  console.log("Success!");
} catch (e) {
  console.log("Failed:", e.message);
}
