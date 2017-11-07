import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';
import { start } from 'ember-cli-qunit';

import { useNativeDOMHelpers } from 'ember-cli-page-object/extend';
import registerWaiter from 'ember-raf-scheduler/test-support/register-waiter';

useNativeDOMHelpers();
registerWaiter();

setResolver(resolver);
start();
