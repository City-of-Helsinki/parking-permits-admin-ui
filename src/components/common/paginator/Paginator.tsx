import { Button, IconAngleLeft, IconAngleRight } from 'hds-react';
import React from 'react';
import { PageInfo } from '../../../types';
import styles from './Paginator.module.scss';

export interface PaginatorProps {
  pageInfo: PageInfo;
  onPage: (page: number) => void;
}

const Paginator = ({
  pageInfo,
  onPage,
}: PaginatorProps): React.ReactElement => {
  const { page, prev, next, numPages } = pageInfo;
  return (
    <div className={styles['paginator-container']}>
      <Button
        theme="black"
        variant="secondary"
        size="small"
        disabled={prev === null}
        onClick={() => onPage(prev || 1)}>
        <IconAngleLeft />
      </Button>
      {Array.from(Array(numPages).keys()).map(index => (
        <Button
          key={index + 1}
          theme="black"
          className={page === index + 1 ? styles['page-active'] : ''}
          variant="secondary"
          size="small"
          onClick={() => onPage(index + 1)}>
          {index + 1}
        </Button>
      ))}
      <Button
        theme="black"
        variant="secondary"
        size="small"
        disabled={next === null}
        onClick={() => onPage(next || 1)}>
        <IconAngleRight />
      </Button>
    </div>
  );
};

export default Paginator;
