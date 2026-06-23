import 'reflect-metadata';
import {
  Data,
  Builder,
  DeepFreeze,
  Retry,
  Serializable,
  Trace,
  Validate,
} from '@a-dev-kit/lombok-typescript/legacy';
import { z } from 'zod';
import '@a-dev-kit/lombok-typescript/validators/zod';

@Trace({ args: false, result: false, timing: true })
class ApiClient {
  private attempts = 0;

  @Retry({ attempts: 2, delay: 10 })
  async fetchStatus(): Promise<string> {
    this.attempts += 1;
    if (this.attempts === 1) throw new Error('transient');
    return 'ok';
  }
}

@Data
@Builder
class SignupDto {
  @Validate(z.string().email())
  email!: string;
}

@DeepFreeze
class FeatureFlags {
  enabled = { auth: true, billing: false };
}

@Serializable
class Profile {
  name: string;
  @Serializable.Exclude
  internalId: string;

  constructor(name: string, internalId: string) {
    this.name = name;
    this.internalId = internalId;
  }
}

export async function demoPhase5Utilities() {
  const api = new ApiClient();
  const status = await api.fetchStatus();

  const signup = SignupDto.builder().email('user@example.com').build();

  const flags = new FeatureFlags();
  const frozen = (() => {
    try {
      (flags.enabled as { auth: boolean }).auth = false;
      return false;
    } catch {
      return true;
    }
  })();

  return {
    status,
    signupEmail: signup.email,
    frozen,
    profileJson: { name: 'Ana', internalId: 'secret' },
  };
}

export { ApiClient, SignupDto, FeatureFlags, Profile };
