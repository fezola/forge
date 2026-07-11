export interface FramerMessage {
  source: string;
  type: string;
  payload: unknown;
}

export function sendToFramer(type: string, payload?: unknown) {
  if (typeof window !== 'undefined' && window.parent) {
    const message: FramerMessage = { source: 'forge-plugin', type, payload };
    window.parent.postMessage(message, '*');
  }
}

export function onFramerMessage(handler: (data: FramerMessage) => void) {
  const listener = (event: MessageEvent<FramerMessage>) => {
    if (event.data?.source === 'framer') {
      handler(event.data);
    }
  };
  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}

export function notifyComponentSelected(componentId: string) {
  sendToFramer('component_selected', { componentId });
}

export function notifyPropertyChanged(componentId: string, prop: string, value: unknown) {
  sendToFramer('property_changed', { componentId, prop, value });
}
