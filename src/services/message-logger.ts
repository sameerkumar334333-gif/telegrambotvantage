import { supabase } from './supabase';

export interface MessageLog {
  telegram_user_id: number;
  telegram_username?: string | null;
  telegram_first_name?: string | null;
  telegram_last_name?: string | null;
  message_text: string;
  direction: 'incoming' | 'outgoing';
  message_type?: 'text' | 'photo' | 'document' | 'video' | 'command';
}

/**
 * Log a message to the database
 */
export async function logMessage(message: MessageLog): Promise<boolean> {
  try {
    // Non-blocking: Don't let logging errors crash the bot
    const { error } = await supabase
      .from('messages')
      .insert({
        telegram_user_id: message.telegram_user_id,
        telegram_username: message.telegram_username || null,
        telegram_first_name: message.telegram_first_name || null,
        telegram_last_name: message.telegram_last_name || null,
        message_text: message.message_text,
        direction: message.direction,
        message_type: message.message_type || 'text',
      });

    if (error) {
      // Check if table doesn't exist
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        console.error('❌ Messages table does not exist! Please run create-messages-table.sql in Supabase');
        // Don't spam - only log once
        return false;
      }
      
      // Only log error, don't throw - bot should continue working
      console.error('Error logging message (non-critical):', error.message || error);
      return false;
    }

    return true;
  } catch (error: any) {
    // Silently handle errors - message logging should never crash the bot
    console.error('Exception logging message (non-critical):', error?.message || error);
    return false;
  }
}

/**
 * Get message statistics
 */
export async function getMessageStatistics() {
  try {
    // Get total messages sent
    const { count: totalSent, error: sentError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('direction', 'outgoing');

    if (sentError) {
      console.error('Error getting total sent messages:', sentError);
    }

    // Get total messages received
    const { count: totalReceived, error: receivedError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('direction', 'incoming');

    if (receivedError) {
      console.error('Error getting total received messages:', receivedError);
    }

    // Get unique users messaged
    const { data: uniqueUsers, error: usersError } = await supabase
      .from('messages')
      .select('telegram_user_id')
      .eq('direction', 'outgoing');

    if (usersError) {
      console.error('Error getting unique users:', usersError);
    }

    const uniqueUserCount = uniqueUsers
      ? new Set(uniqueUsers.map((m) => m.telegram_user_id)).size
      : 0;

    return {
      totalSent: totalSent || 0,
      totalReceived: totalReceived || 0,
      uniqueUsersMessaged: uniqueUserCount,
      totalMessages: (totalSent || 0) + (totalReceived || 0),
    };
  } catch (error) {
    console.error('Exception getting message statistics:', error);
    return {
      totalSent: 0,
      totalReceived: 0,
      uniqueUsersMessaged: 0,
      totalMessages: 0,
    };
  }
}

