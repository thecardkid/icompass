
import StickyNote from '../../src/StickyNote.jsx';
import React from 'react';
import { shallow, mount } from 'enzyme';

const note = {color: '#FFCCFF', text: 'Hello', x: 0.5, y: 0.5},
    width = 1000,
    height = 800;

test('StickyNote component renders the sticky correctly', () => {
    const wrapper = mount(
        <StickyNote note={note} w={width} h={height} />
    );

    const li = wrapper.find('.ic-sticky-note');
    expect(li.text()).toBe('xHello');
});

test('StickyNote component passes note to edit when clicked', () => {
    const onEdit = jest.fn();
    const wrapper = mount(
        <StickyNote note={note} w={width} h={height} edit={onEdit}/>
    );

    const li = wrapper.find('.ic-sticky-note');
    li.simulate('click');
    expect(onEdit).toBeCalledWith(note);
});

