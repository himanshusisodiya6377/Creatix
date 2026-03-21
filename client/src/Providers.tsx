import { useNavigate, NavLink } from 'react-router-dom'
import { AuthUIProvider } from '@daveyplate/better-auth-ui'
import { authClient } from '@/lib/auth-client'

export function Providers({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  return (
    //AuthUIProvider connects better-auth ui to our app
    <AuthUIProvider
      authClient={authClient} //link backend auth
      navigate={navigate}
      //use react router navlink instead
      Link={({ href, children, ...rest }) => (
        <NavLink to={href} {...rest}>
          {children}
        </NavLink>
      )}
    >
      {children}
    </AuthUIProvider>
  )
}