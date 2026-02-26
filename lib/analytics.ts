import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get total views count
export async function getTotalViews(): Promise<number> {
  const { count, error } = await supabase
    .from('destination_views')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error fetching total views:', error);
    return 0;
  }
  
  return count || 0;
}

// Get total visits count (all types)
export async function getTotalVisits(): Promise<number> {
  const { count, error } = await supabase
    .from('destination_visits')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error fetching total visits:', error);
    return 0;
  }
  
  return count || 0;
}

// Get confirmed visits count (actual visits, not just intents)
export async function getConfirmedVisits(): Promise<number> {
  const { count, error } = await supabase
    .from('destination_visits')
    .select('*', { count: 'exact', head: true })
    .eq('visit_type', 'confirmed');
  
  if (error) {
    console.error('Error fetching confirmed visits:', error);
    return 0;
  }
  
  return count || 0;
}

// Get visit intents count (navigation/maps_view)
export async function getVisitIntents(): Promise<number> {
  const { count, error } = await supabase
    .from('destination_visits')
    .select('*', { count: 'exact', head: true })
    .in('visit_type', ['navigation', 'maps_view']);
  
  if (error) {
    console.error('Error fetching visit intents:', error);
    return 0;
  }
  
  return count || 0;
}

// Get most viewed destinations
export async function getMostViewedDestinations(limit: number = 10) {
  const { data, error } = await supabase
    .from('destination_views')
    .select('destination_name, category, municipality')
    .order('viewed_at', { ascending: false })
    .limit(1000); // Get recent views to aggregate
  
  if (error) {
    console.error('Error fetching most viewed:', error);
    return [];
  }
  
  // Aggregate by destination name
  const aggregated: Record<string, { name: string; category: string; municipality: string; views: number }> = {};
  
  data?.forEach((view) => {
    const key = view.destination_name;
    if (!aggregated[key]) {
      aggregated[key] = {
        name: view.destination_name,
        category: view.category || 'Unknown',
        municipality: view.municipality || 'Unknown',
        views: 0,
      };
    }
    aggregated[key].views += 1;
  });
  
  // Sort by views and return top N
  return Object.values(aggregated)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

// Get most visited destinations (all visit types)
export async function getMostVisitedDestinations(limit: number = 10) {
  const { data, error } = await supabase
    .from('destination_visits')
    .select('destination_name, category, municipality, visit_type')
    .order('visited_at', { ascending: false })
    .limit(1000);
  
  if (error) {
    console.error('Error fetching most visited:', error);
    return [];
  }
  
  // Aggregate by destination name
  const aggregated: Record<string, { name: string; category: string; municipality: string; visits: number; confirmed: number }> = {};
  
  data?.forEach((visit) => {
    const key = visit.destination_name;
    if (!aggregated[key]) {
      aggregated[key] = {
        name: visit.destination_name,
        category: visit.category || 'Unknown',
        municipality: visit.municipality || 'Unknown',
        visits: 0,
        confirmed: 0,
      };
    }
    aggregated[key].visits += 1;
    if (visit.visit_type === 'confirmed') {
      aggregated[key].confirmed += 1;
    }
  });
  
  // Sort by visits and return top N
  return Object.values(aggregated)
    .sort((a, b) => b.visits - a.visits)
    .slice(0, limit);
}

// Get most confirmed visits (actual visits only)
export async function getMostConfirmedVisits(limit: number = 10) {
  const { data, error } = await supabase
    .from('destination_visits')
    .select('destination_name, category, municipality')
    .eq('visit_type', 'confirmed')
    .order('visited_at', { ascending: false })
    .limit(1000);
  
  if (error) {
    console.error('Error fetching confirmed visits:', error);
    return [];
  }
  
  // Aggregate by destination name
  const aggregated: Record<string, { name: string; category: string; municipality: string; visits: number }> = {};
  
  data?.forEach((visit) => {
    const key = visit.destination_name;
    if (!aggregated[key]) {
      aggregated[key] = {
        name: visit.destination_name,
        category: visit.category || 'Unknown',
        municipality: visit.municipality || 'Unknown',
        visits: 0,
      };
    }
    aggregated[key].visits += 1;
  });
  
  // Sort by visits and return top N
  return Object.values(aggregated)
    .sort((a, b) => b.visits - a.visits)
    .slice(0, limit);
}

// Get views by category
export async function getViewsByCategory() {
  const { data, error } = await supabase
    .from('destination_views')
    .select('category');
  
  if (error) {
    console.error('Error fetching views by category:', error);
    return [];
  }
  
  // Aggregate by category
  const aggregated: Record<string, number> = {};
  
  data?.forEach((view) => {
    const category = view.category || 'Unknown';
    aggregated[category] = (aggregated[category] || 0) + 1;
  });
  
  return Object.entries(aggregated).map(([name, views]) => ({
    name,
    views,
  }));
}

// Get visits by category
export async function getVisitsByCategory() {
  const { data, error } = await supabase
    .from('destination_visits')
    .select('category');
  
  if (error) {
    console.error('Error fetching visits by category:', error);
    return [];
  }
  
  // Aggregate by category
  const aggregated: Record<string, number> = {};
  
  data?.forEach((visit) => {
    const category = visit.category || 'Unknown';
    aggregated[category] = (aggregated[category] || 0) + 1;
  });
  
  return Object.entries(aggregated).map(([name, visits]) => ({
    name,
    visits,
  }));
}

// Get monthly trends (views and visits)
export async function getMonthlyTrends(months: number = 6) {
  const now = new Date();
  const startDate = new Date();
  startDate.setMonth(now.getMonth() - months);
  
  const { data: viewsData, error: viewsError } = await supabase
    .from('destination_views')
    .select('viewed_at')
    .gte('viewed_at', startDate.toISOString());
  
  const { data: visitsData, error: visitsError } = await supabase
    .from('destination_visits')
    .select('visited_at')
    .gte('visited_at', startDate.toISOString());
  
  if (viewsError || visitsError) {
    console.error('Error fetching monthly trends:', viewsError || visitsError);
    return [];
  }
  
  // Group by month
  const monthly: Record<string, { month: string; views: number; visits: number }> = {};
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  viewsData?.forEach((view) => {
    const date = new Date(view.viewed_at);
    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    if (!monthly[monthKey]) {
      monthly[monthKey] = { month: monthKey, views: 0, visits: 0 };
    }
    monthly[monthKey].views += 1;
  });
  
  visitsData?.forEach((visit) => {
    const date = new Date(visit.visited_at);
    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    if (!monthly[monthKey]) {
      monthly[monthKey] = { month: monthKey, views: 0, visits: 0 };
    }
    monthly[monthKey].visits += 1;
  });
  
  // Sort by date and return
  return Object.values(monthly).sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });
}

// Get total destinations count
export async function getTotalDestinations(): Promise<number> {
  const { count, error } = await supabase
    .from('destinations')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error fetching total destinations:', error);
    return 0;
  }
  
  return count || 0;
}

// Get category count
export async function getCategoryCount(): Promise<number> {
  const { data, error } = await supabase
    .from('destinations')
    .select('category');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return 0;
  }
  
  const uniqueCategories = new Set(data?.map(d => d.category).filter(Boolean));
  return uniqueCategories.size;
}
