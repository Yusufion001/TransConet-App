
export type TrackingStatus = 'STOPPED' | 'ACTIVE';

class BackgroundGeolocationSimulator {
  private status: TrackingStatus = 'STOPPED';

  start() {
    this.status = 'ACTIVE';
    console.log('[Native Tracking Engine] Background Geolocation Service STARTED. GPS hardware active.');
  }

  stop() {
    this.status = 'STOPPED';
    console.log('[Native Tracking Engine] Background Geolocation Service STOPPED. GPS hardware idle to preserve battery.');
  }

  getStatus() {
    return this.status;
  }
}

export const NativeTrackingEngine = new BackgroundGeolocationSimulator();
