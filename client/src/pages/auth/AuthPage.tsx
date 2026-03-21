import { useParams } from "react-router-dom"
import { AuthView } from "@daveyplate/better-auth-ui"


//dynamic page as it depend on path which page to show
const AuthPage =()=> {
  const { pathname } = useParams()

  return (
    //uses authclient to interact with backend
    <main className="p-6 flex flex-col justify-center items-center h-[80vh]">
      <AuthView
        pathname={pathname}
        classNames={{ base: 'bg-black/10 ring ring-indigo-900' }}
      />
    </main>
  )
}

export default AuthPage;