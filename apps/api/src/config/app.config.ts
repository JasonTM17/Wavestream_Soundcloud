import { registerAs } from '@nestjs/config';
import { getValidatedEnv } from 'src/config/env.validation';

export default registerAs('app', () => getValidatedEnv());
