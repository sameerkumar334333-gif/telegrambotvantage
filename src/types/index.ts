export interface Submission {
  id: string;
  telegram_user_id: number;
  telegram_username: string | null;
  telegram_first_name: string;
  telegram_last_name: string | null;
  user_uid: string | null;
  image_url: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes: string;
  created_at: string;
}

export interface UpdateSubmissionRequest {
  status?: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
}

