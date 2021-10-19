import React from 'react';
import { makePrivate } from '../auth/utils';

const Reports = (): React.ReactElement => <div>This is reports page</div>;
export default makePrivate(Reports);
