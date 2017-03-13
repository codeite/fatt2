import React from 'react'
import { mount, shallow, render } from 'enzyme'
import demand from "must"
import sinon from "sinon"

import Timeslip from '../../components/Timeslip'
import ObservableValue from '../../stores/ObservableValue'

describe('<Timeslip />', () => {
  let taskNameOb
  beforeEach(() => {
    taskNameOb = new ObservableValue('', 'myTaskName')
  })

  it('has text "8.0" hours', () => {
    const wrapper = shallow(<Timeslip hours='8.0h' />)
    demand(wrapper.text()).must.contain('8h')
  })

  it('renders name of task', () => {
    const wrapper = render(<Timeslip taskNameOb={taskNameOb}/>)
    demand(wrapper.find('.timeslip-task').text()).must.equal('myTaskName')
  })

  it('reacts if the name of task changes', () => {
    const wrapper = mount(<Timeslip taskNameOb={taskNameOb}/>)
    demand(wrapper.find('.timeslip-task').text()).must.equal('myTaskName')
    taskNameOb.setValue('myNewTaskName')
    demand(wrapper.find('.timeslip-task').text()).must.equal('myNewTaskName')
  })

  it('reports delete events', () => {
    const onDelete = sinon.spy()
    const wrapper = shallow(<Timeslip onDelete={onDelete} />)
    wrapper.find('.timeslip-delete').simulate('click')
    demand(onDelete).must.have.property('callCount', 1)
  });

});