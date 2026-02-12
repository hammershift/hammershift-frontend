import UserEvent from '@/models/userEvent.model';
import connectToDB from '@/lib/mongoose';

export async function trackServerEvent(
  userId: string,
  event_type: string,
  event_data?: object
) {
  try {
    await connectToDB();
    await UserEvent.create({
      user_id: userId,
      event_type,
      event_data,
    });
  } catch (error) {
    console.error('Server event tracking failed:', error);
  }
}
