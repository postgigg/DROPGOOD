import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lyftztgccfslwmdgpslt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjcyOTAsImV4cCI6MjA3Nzg0MzI5MH0.gFsnv1ClJydMzjHZyc9T_TY3kkjwGaf3KQdLjbY7GY4'
);

const { data, error } = await supabase
  .from('donation_centers')
  .select('city, state, name')
  .eq('state', 'VA')
  .order('city');

if (error) {
  console.error('Error:', error);
} else {
  console.log(`\n🎉 Total Virginia donation centers: ${data.length}\n`);
  
  const byCity = {};
  data.forEach(c => {
    if (!byCity[c.city]) byCity[c.city] = 0;
    byCity[c.city]++;
  });
  
  console.log('Coverage by city:');
  Object.keys(byCity).sort().forEach(city => {
    console.log(`  ${city}: ${byCity[city]} centers`);
  });
}
