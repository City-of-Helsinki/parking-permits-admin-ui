import React from 'react';
import { makePrivate } from '../auth/utils';

const Refunds = (): React.ReactElement => <div>This is returns page</div>;
export default makePrivate(Refunds);
