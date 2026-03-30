'use client';

import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Comment {
  _id: string;
  user: { username: string; image?: string };
  text: string;
  createdAt: string;
  position?: 'YES' | 'NO' | null;
}

interface DiscussionFeedProps {
  marketId: string;
}

export function DiscussionFeed({ marketId }: DiscussionFeedProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  // For now, display an empty state with a message input
  // The backend comment API integration can be added later

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !session) return;
    // Stub — would POST to /api/polygon-markets/[marketId]/comments
    setNewComment('');
  }

  return (
    <div className="space-y-4">
      {/* Comment input */}
      {session ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your analysis..."
            className="flex-1 rounded-lg bg-white/[0.05] border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#E94560]/50"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="rounded-lg bg-[#01696F] px-3 py-2 text-sm text-white disabled:opacity-30 hover:bg-[#0C4E54] transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <p className="text-xs text-gray-500">Log in to join the discussion</p>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm">No comments yet. Be the first to share your take!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 rounded-lg p-2">
              <div className="h-8 w-8 rounded-full bg-white/10 shrink-0 flex items-center justify-center text-xs text-gray-400">
                {comment.user.username?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white">{comment.user.username}</span>
                  {comment.position && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      comment.position === 'YES' ? 'bg-[#16c784]/20 text-[#16c784]' : 'bg-[#f44b5a]/20 text-[#f44b5a]'
                    }`}>
                      {comment.position}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-600">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
