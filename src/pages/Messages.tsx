import React from 'react';
import { makePrivate } from '../auth/utils';

const Messages = (): React.ReactElement => <div>This is messages page</div>;
export default makePrivate(Messages);
