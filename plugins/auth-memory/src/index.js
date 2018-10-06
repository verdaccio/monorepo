// @flow

import Memory from './Memory';
import type { VerdaccioMemoryConfig } from '../types';

export default function(config: VerdaccioMemoryConfig, stuff: any) {
  return new Memory(config, stuff);
}
