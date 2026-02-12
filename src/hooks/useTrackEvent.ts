export const useTrackEvent = () => {
  const track = async (event_type: string, event_data?: object) => {
    try {
      await fetch('/api/events/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type, event_data })
      });
    } catch (error) {
      console.error('Event tracking failed:', error);
    }
  };
  return track;
};
