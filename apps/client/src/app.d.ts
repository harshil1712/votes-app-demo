// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Platform {
      env: {
        VOTES_DO: DurableObject;
      };
      cf: CfProperties;
      ctx: ExecutionContext;
    }
  }
}

export {};
