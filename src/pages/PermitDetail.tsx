import React from 'react';
import { useParams } from 'react-router';
import { makePrivate } from '../auth/utils';

const PermitDetail = (): React.ReactElement => {
  const params = useParams();
  const { id } = params;
  return <div>Permit detail page for {id}</div>;
};
export default makePrivate(PermitDetail);
