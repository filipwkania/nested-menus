'use client';

import Image from 'next/image';

import { Menu, Item, Section } from './Menu';
import { StrictMode, useState } from 'react';
import { Picker } from '@adobe/react-spectrum';

export default function Home() {
  let [sections, setSections] = useState([
    {
      name: 'People',
      items: [{ name: 'David' }, { name: 'Same' }, { name: 'Jane' }],
    },
    {
      name: 'Animals',
      items: [{ name: 'Aardvark' }, { name: 'Kangaroo' }, { name: 'Snake' }],
    },
  ]);

  return (
    <StrictMode>
      <Menu
        renderTrigger={(props) => <button {...props}>Actions</button>}
        onAction={alert}
      >
        <Item key='copy'>Copy application</Item>
        <Item key='rename'>Rename application</Item>
        <Item key='move' title='Move to'>
          <Item key='move-to-shared'>Shared</Item>
          <Item key='move-to-desktop' title='Desktop'>
            <Item key='move-to-desktop-1'>Desktop 1</Item>
            <Item key='move-to-desktop-2'>Desktop 2</Item>
          </Item>
          <Item key='move-to-favorite'>Favorite</Item>
        </Item>
        <Item key='delete'>Delete application</Item>
      </Menu>
    </StrictMode>
  );
}
