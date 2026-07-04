export interface User {
  display_name: string;
  user_id: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => Promise<void>;
}

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  displayName: string;
}

export interface TrackDTO {
  spotifyId: string;
  title: string;
  artist: string;
  album: string;
  score: number;
  emotion: string;
}

export interface Genre {
  id: number;
  name: string;
  description: string;
}
