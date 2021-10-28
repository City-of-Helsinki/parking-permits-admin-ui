import React from 'react';
import { makePrivate } from '../auth/utils';

const CreateCompanyPermit = (): React.ReactElement => (
  <div>This is create company permit page</div>
);
export default makePrivate(CreateCompanyPermit);
