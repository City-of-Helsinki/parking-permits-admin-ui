import React from 'react';
import { makePrivate } from '../auth/utils';

const CreateResidentPermit = (): React.ReactElement => (
  <div>This is create resident permit page</div>
);
export default makePrivate(CreateResidentPermit);
