import React, {
  ButtonHTMLAttributes,
  Key,
  ReactElement,
  useLayoutEffect,
  useRef,
} from 'react';
import { AriaMenuProps, MenuTriggerProps } from '@react-types/menu';
import { useMenuTriggerState } from '@react-stately/menu';
import { useTreeState } from '@react-stately/tree';
import { useButton } from '@react-aria/button';
import { FocusScope, useFocusRing } from '@react-aria/focus';
import { useMenu, useMenuItem, useMenuTrigger } from '@react-aria/menu';
import { useOverlayPosition } from '@react-aria/overlays';
import { mergeProps } from '@react-aria/utils';
import { Popover, PopoverProps } from '../Popover';
import { useFocusableRef, useUnwrapDOMRef } from '@react-spectrum/utils';
import {
  FocusableRef,
  FocusStrategy,
  DOMRefValue,
  Node,
} from '@react-types/shared';
import { TreeState } from '@react-stately/tree';
import styles from './Menu.module.css';
import clsx from 'clsx';
import { useHover } from '@react-aria/interactions';
import { useFocusManager } from 'react-aria';

export type SapphireMenuProps<T extends object> = AriaMenuProps<T> &
  MenuTriggerProps & {
    renderTrigger?: (
      props: ButtonHTMLAttributes<Element>,
      isOpen: boolean
    ) => React.ReactNode;
    popoverProps?: PopoverProps;
  };

interface MenuItemProps<T> {
  item: Node<T>;
  state: TreeState<T>;
  onAction?: (key: Key) => void;
  onClose: () => void;
  disabledKeys?: Iterable<Key>;
  parentProps: MenuItemProps<T>;
}

export function MenuItem<T>({
  item,
  state,
  onAction,
  disabledKeys,
  onClose,
}: MenuItemProps<T>): JSX.Element {
  const isDisabled = disabledKeys && [...disabledKeys].includes(item.key);
  const popoverRef = useRef<DOMRefValue<HTMLDivElement>>(null);
  const unwrappedPopoverRef = useUnwrapDOMRef(popoverRef);
  const ref = useFocusableRef<HTMLLIElement>(null);

  const { overlayProps } = useOverlayPosition({
    targetRef: ref,
    overlayRef: unwrappedPopoverRef,
    isOpen: true,
    placement: 'right top',
    offset: 6,
    onClose,
  });

  const { menuItemProps } = useMenuItem(
    {
      key: item.key,
      isDisabled,
      onAction: () =>
        item.hasChildNodes ? state.toggleKey(item.key) : onAction?.(item.key),
      onClose: () =>
        item.hasChildNodes ? state.toggleKey(item.key) : onClose(),
    },
    state,
    ref
  );

  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { focusProps, isFocusVisible } = useFocusRing();

  const focusManager = useFocusManager();

  React.useEffect(() => {
    // display submenu on hover
    if (item.hasChildNodes && isHovered && !state.expandedKeys.has(item.key)) {
      state.toggleKey(item.key);
    } else if (
      !item.hasChildNodes &&
      isHovered &&
      state.expandedKeys.size > 0
    ) {
      state.setExpandedKeys(new Set());
    }
  }, [item.key, state, item.hasChildNodes, isHovered]);

  React.useEffect(() => {
    if (item.hasChildNodes) {
      // subscibe to right and left arrow key press
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === 'ArrowRight' &&
          isFocusVisible &&
          !state.expandedKeys.has(item.key)
        ) {
          state.toggleKey(item.key);
        }
        // should also depend on submenu level if we decide to go deeper
        if (event.key === 'ArrowLeft' && state.expandedKeys.has(item.key)) {
          focusManager?.focusFirst({
            from: ref.current,
          });
          state.toggleKey(item.key);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [item.key, state, item.hasChildNodes, isFocusVisible, focusManager]);

  return (
    <>
      <li
        {...mergeProps(menuItemProps, hoverProps, focusProps)}
        ref={ref}
        className={clsx(
          styles['sapphire-menu-item'],
          styles['js-focus'],
          styles['js-hover'],
          {
            [styles['is-disabled']]: isDisabled,
            [styles['is-focus']]: isFocusVisible,
            [styles['is-hover']]: isHovered,
          }
        )}
      >
        <p className={styles['sapphire-menu-item-overflow']}>{item.rendered}</p>
      </li>
      {item.hasChildNodes && state.expandedKeys.has(item.key) && (
        <Menu
          onAction={(props) => {
            alert(props.valueOf());
            onClose();
          }}
          popoverProps={{
            isOpen: state.expandedKeys.has(item.key),
            ref: popoverRef,
            style: overlayProps.style,
          }}
        >
          {...item.props.children}
        </Menu>
      )}
    </>
  );
}

const MenuPopup = <T extends object>(
  props: {
    autoFocus: FocusStrategy;
    onClose: () => void;
  } & SapphireMenuProps<T>
) => {
  const menuItemState = useTreeState({ ...props, selectionMode: 'none' });
  const menuRef = useRef<HTMLUListElement>(null);
  const { menuProps } = useMenu(props, menuItemState, menuRef);

  return (
    <ul {...menuProps} ref={menuRef} className={styles['sapphire-menu']}>
      {[...menuItemState.collection].map((item) => {
        if (item.type === 'section') {
          throw new Error('Sections not supported');
        }
        return (
          <MenuItem
            key={item.key}
            item={item}
            state={menuItemState}
            onClose={props.onClose}
            onAction={props.onAction}
            disabledKeys={props.disabledKeys}
          />
        );
      })}
    </ul>
  );
};

function _Menu<T extends object>(
  props: SapphireMenuProps<T>,
  ref: FocusableRef<HTMLButtonElement>
) {
  const { renderTrigger, shouldFlip = true } = props;

  const state = useMenuTriggerState(props);
  const triggerRef = useFocusableRef<HTMLButtonElement>(ref);
  const popoverRef = useRef<DOMRefValue<HTMLDivElement>>(null);
  const unwrappedPopoverRef = useUnwrapDOMRef(popoverRef);
  const { menuTriggerProps, menuProps } = useMenuTrigger(
    props,
    state,
    triggerRef
  );
  const { buttonProps } = useButton(menuTriggerProps, triggerRef);
  const isMainMenu = !!renderTrigger;

  const { overlayProps, updatePosition } = useOverlayPosition({
    targetRef: triggerRef,
    overlayRef: unwrappedPopoverRef,
    isOpen: state.isOpen,
    placement: 'bottom start',
    offset: 6,
    onClose: state.close,
    shouldFlip,
  });
  // Fixes an issue where menu with controlled open state opens in wrong place the first time
  useLayoutEffect(() => {
    if (state.isOpen) {
      requestAnimationFrame(() => {
        updatePosition();
      });
    }
  }, [state.isOpen, updatePosition]);

  return (
    <>
      {isMainMenu &&
        renderTrigger({ ref: triggerRef, ...buttonProps }, state.isOpen)}
      <Popover
        isOpen={state.isOpen}
        ref={popoverRef}
        style={overlayProps.style}
        className={clsx(styles['sapphire-menu-container'])}
        shouldCloseOnBlur
        onClose={state.close}
        {...props.popoverProps}
      >
        <FocusScope>
          <MenuPopup
            {...mergeProps(props, menuProps)}
            autoFocus={state.focusStrategy || true}
            onClose={state.close}
          />
        </FocusScope>
      </Popover>
    </>
  );
}

export const Menu = React.forwardRef(_Menu) as <T extends object>(
  props: SapphireMenuProps<T>,
  ref: FocusableRef<HTMLButtonElement>
) => ReactElement;
