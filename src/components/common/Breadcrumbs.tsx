import React from 'react';
import styles from './Breadcrumbs.module.scss';

export interface BreadcrumbsProps extends React.PropsWithChildren<unknown> {
  className?: string;
  separator?: React.ReactNode;
}

const Breadcrumbs = ({
  className,
  separator = '›',
  children,
}: BreadcrumbsProps): React.ReactElement => {
  const listItems = React.Children.toArray(children)
    .filter(child => React.isValidElement(child))
    .reduce<React.ReactElement[]>((items, child, index) => {
      if (index !== 0) {
        const separatorItem = (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`separator-${index}`} className={styles.separator}>
            {separator}
          </li>
        );
        items.push(separatorItem);
      }
      const childItem = (
        // eslint-disable-next-line react/no-array-index-key
        <li key={`child-${index}`} className={styles.item}>
          {child}
        </li>
      );
      items.push(childItem);
      return items;
    }, []);
  return (
    <div className={className}>
      <ol className={styles.list}>{listItems}</ol>
    </div>
  );
};
export default Breadcrumbs;
