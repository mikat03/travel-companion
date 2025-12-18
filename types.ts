
export type TabType = 'chat' | 'itinerary' | 'voice' | 'safety' | 'translate' | 'lens';

export type TimeOfDay = 'sunrise' | 'day' | 'sunset' | 'night';
export type WeatherType = 'clear' | 'cloudy' | 'rainy' | 'misty';

export interface SceneState {
  destination: string;
  theme: 'default' | 'nature' | 'urban' | 'historic' | 'tropical';
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  imageUrl?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  groundingUrls?: { web?: { uri: string; title: string }; maps?: { uri: string; title: string } }[];
}

export interface ActivitySuggestion {
  title: string;
  category: string;
  description: string;
}
