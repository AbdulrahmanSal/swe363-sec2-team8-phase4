import { Link, useNavigate } from 'react-router-dom'
import Icon from '../common/Icon.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { roleDescription } from './navigation.js'

/** Top bar: KFUPM Mall Hub brand on the left, signed-in user and Sign out on the right. */
export default function Topbar() {
  const { user, ownVendor, logout } = useAuth()
  const navigate = useNavigate()

  const signOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="mh-portaltop">
      <Link to="/" className="mh-portalbrand" aria-label="KFUPM Mall Hub home">
        <span className="mh-hubmark" aria-hidden="true">
          MH
        </span>
        <div>
          <b>
            KFUPM <span>MALL HUB</span>
          </b>
          <small>King Fahd University of Petroleum &amp; Minerals</small>
        </div>
      </Link>

      <div className="mh-portaltools">
        <span className="mh-demotag">STUDENT PROJECT · DEMO</span>
        <span className="mh-topdivider" aria-hidden="true" />
        {user ? (
          <>
            <span className="mh-topavatar" aria-hidden="true">
              {user.name.at(0)}
            </span>
            <div className="mh-topidentity">
              <b>{user.name}</b>
              <small>{roleDescription(user, ownVendor)}</small>
            </div>
            <button type="button" className="mh-signout" onClick={signOut} aria-label="Sign out" title="Sign out">
              <Icon name="logout" size={18} />
            </button>
          </>
        ) : (
          <Link to="/login" className="button primary small">
            Login / Sign up
          </Link>
        )}
      </div>
    </header>
  )
}
