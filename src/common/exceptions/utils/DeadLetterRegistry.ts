export const CQRS_REGISTRY = new Map<string, new (...args: any[]) => any>();

export function DeadLetterRegistry(type: string): ClassDecorator {
  return (target: any) => {
    CQRS_REGISTRY.set(type, target);
  };
}