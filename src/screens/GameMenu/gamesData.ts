import type { GamesConfig } from '../../config/types';

export interface GameItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  configKey: keyof GamesConfig;
}

export const games: GameItem[] = [
  {
    id: 'bowl',
    title: 'Miska jedla',
    description: 'Potiahni ingrediencie do misky',
    icon: '🍲',
    path: '/kids/bowl',
    configKey: 'bowlGame',
  },
  {
    id: 'kitchen',
    title: 'Kuchyňa',
    description: 'Spáruj predmety s pomocníkmi',
    icon: '👨‍🍳',
    path: '/kids/kitchen',
    configKey: 'volunteerKitchen',
  },
  {
    id: 'map',
    title: 'Mapa sveta',
    description: 'Nájdi krajiny, kde pomáhame',
    icon: '🗺️',
    path: '/kids/map',
    configKey: 'worldMap',
  },
  {
    id: 'bell',
    title: 'Školský zvonček',
    description: 'Prejdi cestu do školy',
    icon: '🔔',
    path: '/kids/bell',
    configKey: 'schoolBell',
  },
];
