import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lyftztgccfslwmdgpslt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjcyOTAsImV4cCI6MjA3Nzg0MzI5MH0.gFsnv1ClJydMzjHZyc9T_TY3kkjwGaf3KQdLjbY7GY4'
);

const { data } = await supabase
  .from('donation_centers')
  .select('city, name')
  .eq('state', 'VA')
  .order('city');

console.log('\n🎯 VIRGINIA DONATION CENTER COVERAGE\n');
console.log('='.repeat(70));

const byCity = {};
data.forEach(c => {
  if (!byCity[c.city]) byCity[c.city] = [];
  byCity[c.city].push(c.name);
});

Object.keys(byCity).sort().forEach(city => {
  console.log(`\n${city.toUpperCase()} (${byCity[city].length} centers):`);
  byCity[city].forEach(name => console.log(`  • ${name}`));
});

console.log('\n' + '='.repeat(70));
console.log(`TOTAL: ${data.length} CENTERS ACROSS ${Object.keys(byCity).length} CITIES\n`);
