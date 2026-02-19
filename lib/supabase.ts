
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://krdwklhdmtaasmosvesp.supabase.co';
const supabaseAnonKey = 'sb_publishable_mP3zRoLB-hup9N6SLb2Z2g_zi0Ol1VK';

// Persistent storage simulation for sandbox environments
const dummyStorage = {
  getItem: (key: string) => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem: (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch {}
  },
  removeItem: (key: string) => {
    try { localStorage.removeItem(key); } catch {}
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: dummyStorage
  }
});

// --- DATABASE HELPER FUNCTIONS ---

/**
 * Trigger OAuth Social Login
 */
export const signInWithSocial = async (provider: 'google' | 'facebook' | 'apple') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
};

/**
 * Updates or creates a user profile in the public.profiles table
 */
export const upsertProfile = async (id: string, email: string, name: string) => {
  // Safety check for demo IDs to avoid DB errors
  if (id.startsWith('demo-')) return null;

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ 
      id, 
      email: email || `user-${id.substr(0,8)}@example.com`, 
      full_name: name 
    }, { onConflict: 'id' })
    .select()
    .single();
  
  if (error) {
    console.warn("Profile Upsert Warning:", error.message);
  }
  return data;
};

/**
 * Registers a user as an organizer (PENDING APPROVAL)
 */
export const registerOrganizer = async (userId: string, orgName: string, pan: string) => {
  if (userId.startsWith('demo-')) {
    return {
      id: 'demo-org-id-' + Date.now(),
      user_id: userId,
      org_name: orgName,
      pan_number: pan,
      status: 'PENDING'
    };
  }

  const { data, error } = await supabase
    .from('organizers')
    .insert([{
      user_id: userId,
      org_name: orgName,
      pan_number: pan,
      status: 'PENDING'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Admin: Approves an organizer and upgrades their user role
 */
export const approveOrganizer = async (organizerId: string, userId: string) => {
  const { error: orgError } = await supabase
    .from('organizers')
    .update({ status: 'ACTIVE', is_verified: true })
    .eq('id', organizerId);
  
  if (orgError) throw orgError;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'ORGANISER' })
    .eq('id', userId);

  if (profileError) throw profileError;
};

/**
 * Admin: Rejects/Suspends an organizer
 */
export const rejectOrganizer = async (organizerId: string) => {
  const { error } = await supabase
    .from('organizers')
    .update({ status: 'SUSPENDED', is_verified: false })
    .eq('id', organizerId);
  
  if (error) throw error;
};

/**
 * Fetch all organizers for Admin Dashboard
 */
export const getOrganizersForAdmin = async () => {
  const { data, error } = await supabase
    .from('organizers')
    .select('*, profiles(email, full_name, role)');
    
  if (error) throw error;
  return data;
};

/**
 * Publishes a new event with ticket tiers
 */
export const publishEvent = async (eventData: any, ticketTiers: any[], organizerId: string) => {
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert([{
      organiser_id: organizerId,
      title: eventData.title,
      description: eventData.description,
      category: eventData.category,
      city: eventData.location.split(',')[1]?.trim() || 'Coimbatore',
      venue: eventData.location.split(',')[0]?.trim() || 'Venue',
      event_date: eventData.date,
      start_time: eventData.time,
      capacity: eventData.capacity,
      banner_url: eventData.banner,
      status: 'APPROVED'
    }])
    .select()
    .single();

  if (eventError) throw eventError;

  const ticketsToInsert = ticketTiers.map(tier => ({
    event_id: event.id,
    name: tier.name,
    final_price: tier.price || 500,
    base_price: (tier.price || 500) * 0.85,
    gst_amount: (tier.price || 500) * 0.05,
    platform_fee: (tier.price || 500) * 0.08,
    internet_charge: 10,
    total_quantity: tier.quantity,
    type: tier.type || 'REGULAR'
  }));

  const { error: ticketsError } = await supabase
    .from('ticket_types')
    .insert(ticketsToInsert);

  if (ticketsError) throw ticketsError;

  return event;
};

/**
 * Handles a ticket booking transaction
 */
export const createBooking = async (userId: string, eventId: string, ticketTypeId: string, amount: number) => {
  const qrCode = `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const { data: booking, error: bError } = await supabase
    .from('bookings')
    .insert([{
      user_id: userId,
      event_id: eventId,
      total_paid: amount,
      status: 'SUCCESS'
    }])
    .select().single();

  if (bError) throw bError;

  const { error: itemError } = await supabase.from('booking_items').insert([{
    booking_id: booking.id,
    ticket_type_id: ticketTypeId,
    qr_code: qrCode
  }]);

  if (itemError) throw itemError;

  return { booking, qrCode };
};
