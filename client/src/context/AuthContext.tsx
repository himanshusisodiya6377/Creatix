import type { IUser } from "@/assets/assets_thumb"
import api from "@/configs/axios"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

interface AuthContextProps {
  isLoggedIn: boolean
  setIsLoggedIn: (isLoggedIn: boolean) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  user: IUser | null
  setUser: (user: IUser | null) => void
  login: (user: { email: string; password: string }) => Promise<void>
  signUp: (user: { name: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  isLoading: false,
  setIsLoading: () => {},
  user: null,
  setUser: () => {},
  login: async () => {},
  signUp: async () => {},
  logout: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const signUp = async ({
    name,
    email,
    password,
  }: {
    name: string
    email: string
    password: string
  }) => {
    try {
      const { data } = await api.post('/api/auth/register', { name, email, password })
      if (data.user) {
        setUser(data.user as IUser)
        setIsLoggedIn(true)
      }
      toast.success(data.message)
    } catch (error) {
      console.log(error)
    }
  }

  const login = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      if (data.user) {
        setUser(data.user as IUser)
        setIsLoggedIn(true)
      }
      toast.success(data.message)
    } catch (error) {
      console.log(error)
    }
  }

  const logout = async () => {
    try {
      const { data } = await api.post('/api/auth/logout')
      setUser(null)
      setIsLoggedIn(false)
      toast.success(data.message)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/api/auth/verify')
      if (data.user) {
        setUser(data.user as IUser)
        setIsLoggedIn(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    ;(async () => {
      await fetchUser()
    })()
  }, [])

  const value = {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    isLoading,
    setIsLoading,
    signUp,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)