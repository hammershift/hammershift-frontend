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
    <div className='h-screen flex flex-col items-center justify-start pt-16'>
      <div className='w-full max-w-4xl px-8 py-10 sm:px-12 lg:px-16 lg:py-14 mx-auto'>
        <div className='mx-auto max-w-2xl'>
          <div className='text-center'>
            <h2 className='text-xl text-white font-bold sm:text-3xl'>We Value Your Feedback</h2>
            <p className='text-muted-foreground mt-2'>
              Help us improve our application by providing your valuable feedback. As we are in beta testing, your input is crucial for us to make the necessary enhancements.
            </p>
          </div>

          <div className='mt-5 p-6 relative z-10 border border-gray-500 rounded-xl sm:mt-10 md:p-10'>
            <form onSubmit={handleSubmit}>
              <div className='mb-4 sm:mb-8'>
                <label htmlFor='name' className='block mb-2 text-sm font-medium text-white'>
                  Full name
                </label>
                <input
                  type='text'
                  id='name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='py-3 px-4 block w-full border-gray-200 rounded-lg text-sm text-white bg-gray-800 focus:border-blue-500 focus:ring-blue-500'
                  placeholder='Full name'
                />
              </div>

              <div className='mb-4 sm:mb-8'>
                <label htmlFor='email' className='block mb-2 text-sm font-medium text-white'>
                  Email address
                </label>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='py-3 px-4 block w-full border-gray-200 rounded-lg text-sm text-white bg-gray-800 focus:border-blue-500 focus:ring-blue-500'
                  placeholder='Email address'
                />
              </div>

              <div>
                <label htmlFor='comment' className='block mb-2 text-sm font-medium text-white'>
                  Comment
                </label>
                <div className='mt-1'>
                  <textarea
                    id='comment'
                    name='comment'
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className='py-3 px-4 block w-full border-gray-200 rounded-lg text-sm text-white bg-gray-800 focus:border-blue-500 focus:ring-blue-500'
                    placeholder='Leave your comment here...'
                    required
                  ></textarea>
                </div>
              </div>

              <div className='mt-6 grid'>
                <button
                  type='submit'
                  className='w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-yellow-500 text-black hover:bg-yellow-600'
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
              {message && (
                <div className='mt-4 text-center'>
                  <p className='text-sm font-medium text-white'>{message}</p>
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
