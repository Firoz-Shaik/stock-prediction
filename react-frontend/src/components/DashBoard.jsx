import React, { useEffect } from 'react'
import axiosInstance from '../axiosInstance'

const DashBoard = () => {
    useEffect(() => {
        const fetchData = async () => {
            try{
                const response = await axiosInstance.get('protected/');
                cosole.log('Protected data:', response.data);
            }catch(error){
                console.error('Error fetching protected data:', error);
            }
        }
        fetchData();
    }, []);
  return (
    <div className='text-light container'>DashBoard</div>
  )
}

export default DashBoard