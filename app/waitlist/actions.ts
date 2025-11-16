'use server';

import { getSupabaseServerClient } from '@/lib/supabase/server';

type JoinWaitlistParams = {
  email: string;
  name?: string | null;
  note?: string | null;
};

type JoinWaitlistResult = {
  success: boolean;
  message: string;
};

export async function joinWaitlist({
  email,
  name,
  note,
}: JoinWaitlistParams): Promise<JoinWaitlistResult> {
  // Validate email
  if (!email || !email.trim()) {
    return {
      success: false,
      message: 'Email is required.',
    };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
    };
  }

  try {
    const supabase = getSupabaseServerClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist_emails')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        message: 'This email is already on the waitlist.',
      };
    }

    // Insert into waitlist
    const { error } = await supabase.from('waitlist_emails').insert([
      {
        email: email.trim().toLowerCase(),
        name: name?.trim() || null,
        note: note?.trim() || null,
      },
    ]);

    if (error) {
      console.error('Error inserting into waitlist:', error);
      return {
        success: false,
        message: 'Failed to join waitlist. Please try again later.',
      };
    }

    return {
      success: true,
      message: "You're on the waitlist! We'll contact you soon.",
    };
  } catch (error) {
    console.error('Unexpected error joining waitlist:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}

