import React from 'react'
import { Header } from '../components'
import { Button } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const BookingConfirm = () => {
  return (
    <div>
      <Header/>
      <div>
        <Button startIcon={<ArrowBackIosIcon/>}>Quay lại</Button>
      </div>
      <div></div>
    </div>
  )
}

export default BookingConfirm
