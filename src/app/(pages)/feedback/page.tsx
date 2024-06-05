'use client';

import { useState, FormEvent } from 'react';

const FeedbackForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/sendFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || 'Anonymous',
          email: email || 'No email provided',
          comment,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Thank you for your feedback!');
        setComment('');
        setName('');
        setEmail('');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='tw-h-screen tw-flex tw-flex-col tw-items-center tw-justify-start tw-pt-16'>
      <div className='tw-w-full tw-max-w-4xl tw-px-8 tw-py-10 sm:tw-px-12 lg:tw-px-16 lg:tw-py-14 tw-mx-auto'>
        <div className='tw-mx-auto tw-max-w-2xl'>
          <div className='tw-text-center'>
            <h2 className='tw-text-xl tw-text-white tw-font-bold sm:tw-text-3xl'>We Value Your Feedback</h2>
            <p className='tw-text-muted-foreground tw-mt-2'>
              Help us improve our application by providing your valuable feedback. As we are in beta testing, your input is crucial for us to make the necessary enhancements.
            </p>
          </div>

          <div className='tw-mt-5 tw-p-6 tw-relative tw-z-10 tw-border tw-border-gray-500 tw-rounded-xl sm:tw-mt-10 md:tw-p-10'>
            <form onSubmit={handleSubmit}>
              <div className='tw-mb-4 sm:tw-mb-8'>
                <label htmlFor='name' className='tw-block tw-mb-2 tw-text-sm tw-font-medium tw-text-white'>
                  Full name
                </label>
                <input
                  type='text'
                  id='name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='tw-py-3 tw-px-4 tw-block tw-w-full tw-border-gray-200 tw-rounded-lg tw-text-sm tw-text-white tw-bg-gray-800 focus:tw-border-blue-500 focus:tw-ring-blue-500'
                  placeholder='Full name'
                />
              </div>

              <div className='tw-mb-4 sm:tw-mb-8'>
                <label htmlFor='email' className='tw-block tw-mb-2 tw-text-sm tw-font-medium tw-text-white'>
                  Email address
                </label>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='tw-py-3 tw-px-4 tw-block tw-w-full tw-border-gray-200 tw-rounded-lg tw-text-sm tw-text-white tw-bg-gray-800 focus:tw-border-blue-500 focus:tw-ring-blue-500'
                  placeholder='Email address'
                />
              </div>

              <div>
                <label htmlFor='comment' className='tw-block tw-mb-2 tw-text-sm tw-font-medium tw-text-white'>
                  Comment
                </label>
                <div className='tw-mt-1'>
                  <textarea
                    id='comment'
                    name='comment'
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className='tw-py-3 tw-px-4 tw-block tw-w-full tw-border-gray-200 tw-rounded-lg tw-text-sm tw-text-white tw-bg-gray-800 focus:tw-border-blue-500 focus:tw-ring-blue-500'
                    placeholder='Leave your comment here...'
                    required
                  ></textarea>
                </div>
              </div>

              <div className='tw-mt-6 tw-grid'>
                <button
                  type='submit'
                  className='tw-w-full tw-py-3 tw-px-4 tw-inline-flex tw-justify-center tw-items-center tw-gap-x-2 tw-text-sm tw-font-semibold tw-rounded-lg tw-border tw-border-transparent tw-bg-yellow-500 tw-text-black hover:tw-bg-yellow-600'
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
              {message && (
                <div className='tw-mt-4 tw-text-center'>
                  <p className='tw-text-sm tw-font-medium tw-text-white'>{message}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
