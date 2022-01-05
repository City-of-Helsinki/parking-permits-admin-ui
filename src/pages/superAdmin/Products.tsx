import React from 'react';
import { makePrivate } from '../../auth/utils';

const Products = (): React.ReactElement => <div>product prices</div>;
export default makePrivate(Products);
