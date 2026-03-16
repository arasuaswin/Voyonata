// Generates a structured template itinerary based on user inputs
// This will be replaced with AI-generated itineraries when an AI provider is configured

interface TripInput {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: 'budget' | 'moderate' | 'luxury';
  interests: string[];
  notes?: string;
}

interface DayPlan {
  day: number;
  date: string;
  title: string;
  activities: {
    time: string;
    activity: string;
    description: string;
    category: string;
  }[];
}

const interestActivities: Record<string, { activity: string; description: string; category: string }[]> = {
  culture: [
    { activity: 'Visit local museums', description: 'Explore art, history, and cultural exhibitions', category: 'culture' },
    { activity: 'Historical walking tour', description: 'Walk through the old town and learn about local heritage', category: 'culture' },
    { activity: 'Traditional craft workshop', description: 'Hands-on experience with local artisan techniques', category: 'culture' },
    { activity: 'Visit heritage sites', description: 'Explore UNESCO World Heritage locations', category: 'culture' },
  ],
  food: [
    { activity: 'Food market tour', description: 'Sample local delicacies at the best street markets', category: 'food' },
    { activity: 'Cooking class', description: 'Learn to prepare authentic local dishes', category: 'food' },
    { activity: 'Fine dining experience', description: 'Reserve a table at a top-rated local restaurant', category: 'food' },
    { activity: 'Street food crawl', description: 'Taste the city\'s best hidden food gems', category: 'food' },
  ],
  adventure: [
    { activity: 'Hiking & trekking', description: 'Explore scenic trails and viewpoints', category: 'adventure' },
    { activity: 'Water sports', description: 'Try kayaking, surfing, or snorkeling', category: 'adventure' },
    { activity: 'Zip-lining or paragliding', description: 'Get an adrenaline rush with aerial adventures', category: 'adventure' },
    { activity: 'Wildlife safari', description: 'Spot exotic wildlife in their natural habitat', category: 'adventure' },
  ],
  relaxation: [
    { activity: 'Spa & wellness retreat', description: 'Unwind with a full-body massage and thermal baths', category: 'relaxation' },
    { activity: 'Beach day', description: 'Relax on pristine beaches with crystal-clear water', category: 'relaxation' },
    { activity: 'Sunset cruise', description: 'Enjoy golden hour on the water', category: 'relaxation' },
    { activity: 'Yoga session', description: 'Morning yoga with scenic views', category: 'relaxation' },
  ],
  nightlife: [
    { activity: 'Rooftop bar hopping', description: 'Experience the city\'s best cocktail bars', category: 'nightlife' },
    { activity: 'Live music venue', description: 'Catch a local band or jazz performance', category: 'nightlife' },
    { activity: 'Night market', description: 'Explore vibrant night bazaars', category: 'nightlife' },
    { activity: 'Theater or show', description: 'Watch a cultural performance or comedy night', category: 'nightlife' },
  ],
  shopping: [
    { activity: 'Local boutique shopping', description: 'Find unique souvenirs and handmade goods', category: 'shopping' },
    { activity: 'Artisan market visit', description: 'Browse handcrafted jewelry, textiles, and art', category: 'shopping' },
    { activity: 'Shopping district tour', description: 'Explore the city\'s premier shopping areas', category: 'shopping' },
    { activity: 'Antique hunting', description: 'Discover vintage treasures and collectibles', category: 'shopping' },
  ],
  photography: [
    { activity: 'Golden hour photo walk', description: 'Capture stunning shots during the best lighting', category: 'photography' },
    { activity: 'Landmark photography', description: 'Visit the most photogenic spots in the city', category: 'photography' },
    { activity: 'Street photography tour', description: 'Document the vibrant local street life', category: 'photography' },
    { activity: 'Drone photography spots', description: 'Find panoramic viewpoints for aerial shots', category: 'photography' },
  ],
};

const defaultActivities = [
  { activity: 'Explore the neighborhood', description: 'Walk around and discover hidden gems nearby', category: 'exploration' },
  { activity: 'Visit a local café', description: 'Take a break and soak in the atmosphere', category: 'food' },
  { activity: 'Park or garden visit', description: 'Enjoy green spaces and people-watching', category: 'relaxation' },
];

const timeSlots = [
  '08:00 AM', '10:00 AM', '12:30 PM', '02:30 PM', '05:00 PM', '07:30 PM'
];

export function generateTemplateItinerary(input: TripInput): DayPlan[] {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  // Collect all available activities from the user's selected interests
  const allActivities: { activity: string; description: string; category: string }[] = [];
  for (const interest of input.interests) {
    const activities = interestActivities[interest.toLowerCase()];
    if (activities) {
      allActivities.push(...activities);
    }
  }
  
  // If no matching interests, use defaults
  if (allActivities.length === 0) {
    allActivities.push(...defaultActivities);
  }

  const itinerary: DayPlan[] = [];
  let activityIndex = 0;

  for (let day = 0; day < totalDays; day++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + day);
    
    const dayTitle = day === 0 
      ? `Arrival in ${input.destination}` 
      : day === totalDays - 1 
        ? `Final Day in ${input.destination}` 
        : `Day ${day + 1} — Exploring ${input.destination}`;

    // Generate 4-6 activities per day
    const activitiesPerDay = input.budget === 'luxury' ? 5 : input.budget === 'budget' ? 3 : 4;
    const dayActivities: DayPlan['activities'] = [];

    // Arrival day starts later
    const startSlot = day === 0 ? 2 : 0;
    // Departure day ends earlier
    const endSlot = day === totalDays - 1 ? Math.min(timeSlots.length, 4) : timeSlots.length;

    for (let i = startSlot; i < Math.min(startSlot + activitiesPerDay, endSlot); i++) {
      const act = allActivities[activityIndex % allActivities.length];
      dayActivities.push({
        time: timeSlots[i],
        activity: act.activity,
        description: act.description,
        category: act.category,
      });
      activityIndex++;
    }

    itinerary.push({
      day: day + 1,
      date: currentDate.toISOString().split('T')[0],
      title: dayTitle,
      activities: dayActivities,
    });
  }

  return itinerary;
}
