import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { error } = await supabase
      .from('social_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', 'youtube')
      .is('client_id', null);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting global YouTube:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
