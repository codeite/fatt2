import React from 'react'

export const YearStats = ({yearStats}) => {
  return <table>
    <tbody>
      <tr>
        <td>Days works:</td>
        <td>{yearStats.workedDays}</td>
      </tr>
      <tr>
        <td>Days off:</td>
        <td>{yearStats.holidayDays}</td>
      </tr>
      <tr>
        <td>Days untracked:</td>
        <td>{yearStats.untrackedDays}</td>
      </tr>
      <tr>
        <td>Weekend days:</td>
        <td>{yearStats.weekendDays}</td>
      </tr>
      <tr>
        <td>Total:</td>
        <td>{yearStats.workedDays + yearStats.holidayDays + yearStats.untrackedDays + yearStats.weekendDays}</td>
      </tr>
    </tbody>
  </table>
}
