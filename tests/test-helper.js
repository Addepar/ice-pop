import resolver from './helpers/resolver';
import { setResolver } from 'ember-qunit';
import { start } from 'ember-qunit';

import registerWaiter from 'ember-raf-scheduler/test-support/register-waiter';

registerWaiter();

setResolver(resolver);
start();
