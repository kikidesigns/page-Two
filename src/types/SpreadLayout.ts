import { Vector3 } from 'three';

export interface CardPosition {
  position: Vector3;
  rotation: Vector3;
  name: string;
  description: string;
}

export interface SpreadLayout {
  name: string;
  description: string;
  positions: CardPosition[];
}

export const SPREADS = {
  THREE_CARD: {
    name: 'Three Card Spread',
    description: 'Past, Present, Future',
    positions: [
      {
        position: new Vector3(-2.5, 0.5, 0),
        rotation: new Vector3(0, 0, 0),
        name: 'Past',
        description: 'Past influences'
      },
      {
        position: new Vector3(0, 0.5, 0),
        rotation: new Vector3(0, 0, 0),
        name: 'Present',
        description: 'Current situation'
      },
      {
        position: new Vector3(2.5, 0.5, 0),
        rotation: new Vector3(0, 0, 0),
        name: 'Future',
        description: 'Future outcome'
      }
    ]
  },
  CELTIC_CROSS: {
    name: 'Celtic Cross',
    description: 'Traditional 10-card spread',
    positions: [
      {
        position: new Vector3(0, 0.5, 0),
        rotation: new Vector3(0, 0, 0),
        name: 'Significator',
        description: 'Central theme'
      }
      // Additional positions will be added later
    ]
  }
} as const;