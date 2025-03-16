import { EventEmitter } from 'events';
import { SpreadLayout } from '../types/SpreadLayout';

interface AppState {
  currentSpread: SpreadLayout | null;
  selectedCard: number | null;
  isMultiplayer: boolean;
  roomId: string | null;
  customDeck: boolean;
}

export class StateManager extends EventEmitter {
  private state: AppState = {
    currentSpread: null,
    selectedCard: null,
    isMultiplayer: false,
    roomId: null,
    customDeck: false
  };

  constructor() {
    super();
  }

  public initialize(): void {
    // Initialize WebSocket connection for multiplayer
    this.setupMultiplayer();
  }

  private setupMultiplayer(): void {
    // WebSocket setup will go here
    // This is a placeholder for the actual implementation
  }

  public getState(): AppState {
    return { ...this.state };
  }

  public setState(newState: Partial<AppState>): void {
    this.state = {
      ...this.state,
      ...newState
    };
    this.emit('stateChange', this.state);
  }

  public setSpread(spread: SpreadLayout): void {
    this.setState({ currentSpread: spread });
  }

  public selectCard(index: number | null): void {
    this.setState({ selectedCard: index });
  }

  public joinRoom(roomId: string): void {
    this.setState({ 
      isMultiplayer: true,
      roomId 
    });
    // Implement room joining logic
  }

  public leaveRoom(): void {
    this.setState({ 
      isMultiplayer: false,
      roomId: null 
    });
    // Implement room leaving logic
  }
}