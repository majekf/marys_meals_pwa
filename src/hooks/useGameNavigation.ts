import { useLocation } from 'react-router-dom';
import { useConfig } from '../config';
import { games } from '../screens/GameMenu/gamesData';

export interface GameNavItem {
  title: string;
  path: string;
}

export function useGameNavigation() {
  const { config } = useConfig();
  const location = useLocation();

  const enabledGames = games.filter(
    (game) => config.features.kidsMode.games[game.configKey]
  );

  const currentIndex = enabledGames.findIndex((g) => g.path === location.pathname);

  if (currentIndex === -1) {
    return { prevGame: null as GameNavItem | null, nextGame: null as GameNavItem | null };
  }

  const prevGame: GameNavItem | null =
    currentIndex > 0
      ? { title: enabledGames[currentIndex - 1].title, path: enabledGames[currentIndex - 1].path }
      : null;

  const nextGame: GameNavItem | null =
    currentIndex < enabledGames.length - 1
      ? { title: enabledGames[currentIndex + 1].title, path: enabledGames[currentIndex + 1].path }
      : null;

  return { prevGame, nextGame };
}
