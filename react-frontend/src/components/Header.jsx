import React, { useContext } from 'react'
import Button from './Button'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from './AuthProvider'

const Header = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setIsAuthenticated(false)
    navigate('/login') // Redirect to login page after logout
  }

  return (
    <>
        <nav className='navbar container pt-3 pb-3 align-items-start'>
            <Link className='navbar-brand text-light' to='/'>Stock Predictor</Link>

            <div>
                {isAuthenticated ? (
                  <button text='Log Out' class='btn-danger text-center rounded' onClick={handleLogout}>Log Out</button>
                ) : (
                  <>
                    <Button text='Login' class='btn-outline-info' url='/login' />
                    &nbsp;
                    <Button text='Sign Up' class='btn-info' url='/register' />
                  </>)}
            </div>
        </nav>    
    </>
  )
}

export default Header