import classNames from 'classnames';
import { Checkbox, Fieldset, IconAlertCircleFill } from 'hds-react';
import React, { useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSet from '../../hooks/useSet';
import { mapValues } from '../../utils';
import styles from './CheckboxGroup.module.scss';

const T_PATH = 'components.common.checkboxGroup';

/* Types */

enum CheckboxState {
  checked,
  unchecked,
  indeterminate,
}

interface ReducerAction {
  type: 'check' | 'uncheck' | 'checkAll' | 'uncheckAll';
  payload: string;
}

type CheckboxGroupState = Record<string, CheckboxState>;

export type CheckboxGroupOption = {
  label: string;
  checked?: boolean;
  value: string;
};

interface CheckboxGroupProps {
  options: CheckboxGroupOption[];
  heading: string;
  idPrefix: string;
  required?: boolean;
  errorText?: string;
  name: string;
  onChange: (values: string[]) => void;
  className?: string;
}

/* Utils */

const areAllChecked = (state: CheckboxGroupState) =>
  Object.values(state).every(value => value === CheckboxState.checked);

const areAllUnchecked = (state: CheckboxGroupState) =>
  Object.values(state).every(value => value === CheckboxState.unchecked);

const determineControllerState = (state: CheckboxGroupState) => {
  if (areAllChecked(state)) {
    return CheckboxState.checked;
  }
  if (areAllUnchecked(state)) {
    return CheckboxState.unchecked;
  }
  return CheckboxState.indeterminate;
};

/* Component */

const CheckboxGroup = ({
  options,
  heading,
  idPrefix,
  required,
  errorText,
  name,
  onChange,
  className,
}: CheckboxGroupProps): React.ReactElement => {
  const { t } = useTranslation();

  const controllerId = `${idPrefix}-controller`;
  const allValues = new Set(options.map(option => option.value));

  // Assign an automatically generated id to each option.
  const idToOption = options.reduce<Record<string, CheckboxGroupOption>>(
    (acc, option, idx) => ({
      ...acc,
      [`${idPrefix}-${idx}`]: option,
    }),
    {}
  );

  const initialState = Object.entries(idToOption).reduce<
    Record<string, CheckboxState>
  >(
    (acc, [key, option]) => ({
      ...acc,
      [key]: option.checked ? CheckboxState.checked : CheckboxState.unchecked,
    }),
    {}
  );

  // Selected values as a set.
  const [
    values,
    {
      add: addValues,
      delete: deleteValues,
      clear: clearValues,
      set: setValues,
    },
  ] = useSet<string>(new Set());

  const [state, dispatch] = useReducer(
    (
      prevState: CheckboxGroupState,
      action: ReducerAction
    ): Record<string, CheckboxState> => {
      switch (action.type) {
        case 'checkAll':
          return mapValues(prevState, CheckboxState.checked);
        case 'uncheckAll':
          return mapValues(prevState, CheckboxState.unchecked);
        case 'check':
          return {
            ...prevState,
            [action.payload]: CheckboxState.checked,
          };
        case 'uncheck':
          return {
            ...prevState,
            [action.payload]: CheckboxState.unchecked,
          };
        default:
          throw new Error();
      }
    },
    initialState
  );

  const [controllerState, setControllerState] = useState(
    determineControllerState(initialState)
  );

  useEffect(() => setControllerState(determineControllerState(state)), [state]);

  return (
    <Fieldset heading={required ? `${heading} *` : heading}>
      <Checkbox
        id={controllerId}
        className={styles.checkboxController}
        label={t(`${T_PATH}.selectAll`)}
        indeterminate={controllerState === CheckboxState.indeterminate}
        checked={controllerState === CheckboxState.checked}
        onChange={() => {
          const action: ReducerAction =
            controllerState === CheckboxState.checked
              ? { type: 'uncheckAll', payload: controllerId }
              : { type: 'checkAll', payload: controllerId };
          dispatch(action);

          if (action.type === 'checkAll') {
            setValues(new Set(allValues));
            onChange(Array.from(allValues));
          } else {
            clearValues();
            onChange([]);
          }
        }}
      />
      <div className={classNames(styles.checkboxGrid, className)}>
        {Object.entries(state).map(([key, checked]) => {
          const option = idToOption[key];
          return (
            <Checkbox
              key={key}
              id={key}
              className={styles.checkbox}
              label={option.label}
              name={name}
              onChange={() => {
                const action: ReducerAction =
                  checked === CheckboxState.checked
                    ? { type: 'uncheck', payload: key }
                    : { type: 'check', payload: key };
                dispatch(action);

                if (action.type === 'check') {
                  values.add(option.value);
                  addValues(option.value);
                } else {
                  values.delete(option.value);
                  deleteValues(option.value);
                }
                onChange(Array.from(values));
              }}
              value={option.value}
              checked={checked === CheckboxState.checked}
            />
          );
        })}
      </div>
      {errorText && (
        <div className={styles.errorText}>
          <IconAlertCircleFill className={styles.errorIcon} /> {errorText}
        </div>
      )}
    </Fieldset>
  );
};

export default CheckboxGroup;
