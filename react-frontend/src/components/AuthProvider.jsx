import { createContext, useState } from 'react'

const AuthContext = createContext()

const AuthProvider = ({ children }) => {

    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('accessToken') ? true : false)

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext }
export default AuthProvider