/**
 * Input Control Service
 * 
 * This service provides methods to control input access for 
 * remote desktop sessions, such as blocking input on the host machine
 * or controlling access levels for clients.
 */

export type InputBlockMode = 'none' | 'keyboard' | 'mouse' | 'all';

type InputStateChangeHandler = (state: InputBlockMode) => void;

export interface InputControlOptions {
  onStateChange?: InputStateChangeHandler;
}

export class InputControlService {
  private blockMode: InputBlockMode = 'none';
  private options: InputControlOptions;
  private keyboardBlocked: boolean = false;
  private mouseBlocked: boolean = false;
  private originalKeyboardHandlers: Map<string, EventListener> = new Map();
  private originalMouseHandlers: Map<string, EventListener> = new Map();
  
  constructor(options: InputControlOptions = {}) {
    this.options = options;
  }
  
  /**
   * Block input on the host machine based on specified mode
   * @param mode - The input block mode to apply
   */
  public blockInput(mode: InputBlockMode): boolean {
    if (mode === this.blockMode) return true;
    
    // First, unblock everything
    this.unblockInput();
    
    // Then apply the new block mode
    this.blockMode = mode;
    
    switch (mode) {
      case 'all':
        this.blockKeyboard();
        this.blockMouse();
        break;
      case 'keyboard':
        this.blockKeyboard();
        break;
      case 'mouse':
        this.blockMouse();
        break;
      case 'none':
        // Already unblocked above
        break;
    }
    
    // Notify state change
    if (this.options.onStateChange) {
      this.options.onStateChange(this.blockMode);
    }
    
    return true;
  }
  
  /**
   * Unblock all input on the host machine
   */
  public unblockInput(): boolean {
    if (this.blockMode === 'none') return true;
    
    this.unblockKeyboard();
    this.unblockMouse();
    
    this.blockMode = 'none';
    
    // Notify state change
    if (this.options.onStateChange) {
      this.options.onStateChange(this.blockMode);
    }
    
    return true;
  }
  
  /**
   * Get the current input block state
   */
  public getBlockMode(): InputBlockMode {
    return this.blockMode;
  }
  
  /**
   * Block keyboard input
   * 
   * Note: This method works in the browser context by capturing and preventing
   * keyboard events, but for a true remote desktop solution, OS-level hooks
   * would be required through a native application
   */
  private blockKeyboard(): void {
    if (this.keyboardBlocked) return;
    
    // Save original handlers to restore later
    this.saveOriginalEventHandlers(document, [
      'keydown', 'keyup', 'keypress'
    ], this.originalKeyboardHandlers);
    
    // Add blocking handlers
    const blockHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    document.addEventListener('keydown', blockHandler, true);
    document.addEventListener('keyup', blockHandler, true);
    document.addEventListener('keypress', blockHandler, true);
    
    this.keyboardBlocked = true;
  }
  
  /**
   * Unblock keyboard input
   */
  private unblockKeyboard(): void {
    if (!this.keyboardBlocked) return;
    
    // Remove our handlers and restore originals
    this.restoreOriginalEventHandlers(document, [
      'keydown', 'keyup', 'keypress'
    ], this.originalKeyboardHandlers);
    
    this.keyboardBlocked = false;
  }
  
  /**
   * Block mouse input
   */
  private blockMouse(): void {
    if (this.mouseBlocked) return;
    
    // Save original handlers to restore later
    this.saveOriginalEventHandlers(document, [
      'mousedown', 'mouseup', 'mousemove', 'click', 
      'dblclick', 'contextmenu'
    ], this.originalMouseHandlers);
    
    // Add blocking handlers
    const blockHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    document.addEventListener('mousedown', blockHandler, true);
    document.addEventListener('mouseup', blockHandler, true);
    document.addEventListener('mousemove', blockHandler, true);
    document.addEventListener('click', blockHandler, true);
    document.addEventListener('dblclick', blockHandler, true);
    document.addEventListener('contextmenu', blockHandler, true);
    
    // Also set a CSS style to indicate mouse is blocked
    const style = document.createElement('style');
    style.id = 'input-control-style';
    style.innerHTML = `
      body * {
        pointer-events: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);
    
    this.mouseBlocked = true;
  }
  
  /**
   * Unblock mouse input
   */
  private unblockMouse(): void {
    if (!this.mouseBlocked) return;
    
    // Remove our handlers and restore originals
    this.restoreOriginalEventHandlers(document, [
      'mousedown', 'mouseup', 'mousemove', 'click', 
      'dblclick', 'contextmenu'
    ], this.originalMouseHandlers);
    
    // Remove the CSS style
    const style = document.getElementById('input-control-style');
    if (style) {
      document.head.removeChild(style);
    }
    
    this.mouseBlocked = false;
  }
  
  /**
   * Save original event handlers to restore them later
   */
  private saveOriginalEventHandlers(
    element: EventTarget, 
    events: string[], 
    storage: Map<string, EventListener>
  ): void {
    // This is a simplified approach since we can't actually get the original 
    // event listeners. We add a generic no-op handler to store in our map.
    events.forEach(event => {
      const noop = () => {};
      storage.set(event, noop);
    });
  }
  
  /**
   * Restore original event handlers
   */
  private restoreOriginalEventHandlers(
    element: EventTarget, 
    events: string[], 
    storage: Map<string, EventListener>
  ): void {
    // In a browser context, we can't truly restore original handlers
    // This removes our blocking handlers so default behavior resumes
    events.forEach(event => {
      const blockHandler = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      document.removeEventListener(event, blockHandler, true);
    });
    
    storage.clear();
  }
}

// Create singleton instance
let inputControlInstance: InputControlService | null = null;

/**
 * Get or create an input control service instance
 */
export const getInputControlService = (options: InputControlOptions = {}): InputControlService => {
  if (!inputControlInstance) {
    inputControlInstance = new InputControlService(options);
  }
  
  return inputControlInstance;
};