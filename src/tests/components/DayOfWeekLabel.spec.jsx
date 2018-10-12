import React from 'react'
import { shallow } from 'enzyme'
import demand from 'must'
import mustEnzyme from '../helpers/must-enzyme'
mustEnzyme(demand)

import DayOfWeekLabel from '../../components/DayOfWeekLabel'

describe('<DayOfWeekLabel />', () => {
  it('should render 2017-01-01 as "Sun" which is on the weekend', () => {
    const wrapper = shallow(<DayOfWeekLabel date="2017-01-01" />)
    demand(wrapper.text()).must.contain('Sun')
    demand(wrapper.find('.day-of-week-label')).must.haveClass('weekend')
  })

  it('should render 2017-01-02 as "Mon" which is on the weekend', () => {
    const wrapper = shallow(<DayOfWeekLabel date="2017-01-02" />)
    demand(wrapper.text()).must.contain('Mon')
    demand(wrapper.find('.day-of-week-label')).must.haveClass('weekday')
  })
})
