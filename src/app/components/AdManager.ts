// AdManager utility to prevent duplicate ad loading
class AdManager {
  private static instance: AdManager;
  private loadedSlots: Set<string> = new Set();
  private isInitialized = false;

  static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    
    if (typeof window !== 'undefined') {
      // Initialize AdSense array
      window.adsbygoogle = window.adsbygoogle || [];
      this.isInitialized = true;
    }
  }

  isSlotLoaded(slotId: string): boolean {
    return this.loadedSlots.has(slotId);
  }

  markSlotAsLoaded(slotId: string) {
    this.loadedSlots.add(slotId);
  }

  clearSlot(slotId: string) {
    this.loadedSlots.delete(slotId);
  }

  reset() {
    this.loadedSlots.clear();
    this.isInitialized = false;
  }
}

export default AdManager;