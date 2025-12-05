import { Handler } from '@netlify/functions';
import { supabase } from '../../dist/services/supabase';
import { sendVerificationMessage, sendRejectionMessage, sendCustomMessage } from '../../dist/services/bot-messaging';
import { UpdateSubmissionRequest } from '../../dist/types';

// Simple session store for Netlify
const sessions = new Map<string, any>();

function getSessionId(cookies: string): string | null {
  if (!cookies) return null;
  const match = cookies.match(/admin\.sid=([^;]+)/);
  return match ? match[1] : null;
}

function isAuthenticated(cookies: string): boolean {
  const sessionId = getSessionId(cookies);
  if (!sessionId) return false;
  const session = sessions.get(sessionId);
  return session?.authenticated || false;
}

export const handler: Handler = async (event, context) => {
  // Check authentication
  if (!isAuthenticated(event.headers.cookie || '')) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const path = event.path.replace('/.netlify/functions/api', '') || '/';
  const method = event.httpMethod;

  // GET /api/submissions
  if (method === 'GET' && path === '/submissions') {
    try {
      const { status, search } = event.queryStringParameters || {};

      let query = supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (status && status !== 'All') {
        query = query.eq('status', status);
      }

      if (search && search.trim()) {
        const searchTerm = search.trim();
        const uid = parseInt(searchTerm, 10);
        if (!isNaN(uid)) {
          query = query.eq('telegram_user_id', uid);
        } else {
          query = query.ilike('telegram_username', `%${searchTerm}%`);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching submissions:', error);
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Failed to fetch submissions' }),
        };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions: data || [] }),
      };
    } catch (error) {
      console.error('Error in GET /api/submissions:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }
  }

  // PATCH /api/submissions/:id
  if (method === 'PATCH' && path.startsWith('/submissions/')) {
    try {
      const id = path.split('/submissions/')[1];
      const { status, notes }: UpdateSubmissionRequest = JSON.parse(event.body || '{}');

      const updateData: Partial<UpdateSubmissionRequest> = {};

      if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
        updateData.status = status;
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      if (Object.keys(updateData).length === 0) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'No valid fields to update' }),
        };
      }

      // Get current submission
      const { data: currentData } = await supabase
        .from('submissions')
        .select('status, telegram_user_id')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating submission:', error);
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Failed to update submission' }),
        };
      }

      if (!data) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Submission not found' }),
        };
      }

      // Send messages if status changed
      if (status === 'Approved' && currentData?.status !== 'Approved' && data.telegram_user_id) {
        sendVerificationMessage(data.telegram_user_id).catch((err) => {
          console.error('Failed to send verification message:', err);
        });
      }

      if (status === 'Rejected' && currentData?.status !== 'Rejected' && data.telegram_user_id) {
        sendRejectionMessage(data.telegram_user_id).catch((err) => {
          console.error('Failed to send rejection message:', err);
        });
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission: data }),
      };
    } catch (error) {
      console.error('Error in PATCH /api/submissions/:id:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }
  }

  // POST /api/submissions/:id/send-message
  if (method === 'POST' && path.includes('/send-message')) {
    try {
      const id = path.split('/submissions/')[1]?.split('/send-message')[0];
      const { message } = JSON.parse(event.body || '{}');

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Message is required' }),
        };
      }

      const { data: submission, error: fetchError } = await supabase
        .from('submissions')
        .select('telegram_user_id')
        .eq('id', id)
        .single();

      if (fetchError || !submission) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Submission not found' }),
        };
      }

      if (!submission.telegram_user_id) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'User ID not found for this submission' }),
        };
      }

      const success = await sendCustomMessage(submission.telegram_user_id, message.trim());

      if (success) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, message: 'Message sent successfully' }),
        };
      } else {
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Failed to send message' }),
        };
      }
    } catch (error) {
      console.error('Error in POST /api/submissions/:id/send-message:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Not found' }),
  };
};
