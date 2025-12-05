import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { requireAuth } from '../middleware/auth';
import { UpdateSubmissionRequest } from '../types';
import { sendVerificationMessage, sendRejectionMessage, sendCustomMessage } from '../services/bot-messaging';

const router = Router();

// All API routes require authentication
router.use(requireAuth);

// GET /api/submissions - Fetch all submissions
router.get('/submissions', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    let query = supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status && status !== 'All' && typeof status === 'string') {
      query = query.eq('status', status);
    }

    // Search by UID or username if provided
    if (search && typeof search === 'string') {
      const searchTerm = search.trim();
      if (searchTerm) {
        // Try to parse as number (UID) or search as text (username)
        const uid = parseInt(searchTerm, 10);
        if (!isNaN(uid)) {
          query = query.eq('telegram_user_id', uid);
        } else {
          query = query.ilike('telegram_username', `%${searchTerm}%`);
        }
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ error: 'Failed to fetch submissions' });
      return;
    }

    res.json({ submissions: data || [] });
  } catch (error) {
    console.error('Error in GET /api/submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/submissions/:id - Update submission status and/or notes
router.patch('/submissions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes }: UpdateSubmissionRequest = req.body;

    const updateData: Partial<UpdateSubmissionRequest> = {};

    if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    // Get current submission to check if status is changing to Approved
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
      res.status(500).json({ error: 'Failed to update submission' });
      return;
    }

    if (!data) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    // If status changed to Approved, send verification message
    if (status === 'Approved' && currentData?.status !== 'Approved' && data.telegram_user_id) {
      // Send message asynchronously (don't wait for it)
      sendVerificationMessage(data.telegram_user_id).catch((err) => {
        console.error('Failed to send verification message:', err);
      });
    }

    // If status changed to Rejected, send rejection message
    if (status === 'Rejected' && currentData?.status !== 'Rejected' && data.telegram_user_id) {
      // Send message asynchronously (don't wait for it)
      sendRejectionMessage(data.telegram_user_id).catch((err) => {
        console.error('Failed to send rejection message:', err);
      });
    }

    res.json({ submission: data });
  } catch (error) {
    console.error('Error in PATCH /api/submissions/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/submissions/:id/send-message - Send custom message to user
router.post('/submissions/:id/send-message', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Get submission to get user ID
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('telegram_user_id')
      .eq('id', id)
      .single();

    if (fetchError || !submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    if (!submission.telegram_user_id) {
      res.status(400).json({ error: 'User ID not found for this submission' });
      return;
    }

    // Send message
    const success = await sendCustomMessage(submission.telegram_user_id, message.trim());

    if (success) {
      res.json({ success: true, message: 'Message sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send message' });
    }
  } catch (error) {
    console.error('Error in POST /api/submissions/:id/send-message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

