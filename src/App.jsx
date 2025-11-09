import { useCallback, useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from './pages/Home';
import Login from './pages/Login';
import OpportunitiesPage from './pages/Opportunities';
import ProfilePage from './pages/Profile';

const DEFAULT_PROFILE = {
  name: 'Guest User',
  interests: ['environment'],
};

const readProfileFromStorage = () => {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;

  try {
    const stored = localStorage.getItem('userProfile');
    if (!stored) return DEFAULT_PROFILE;

    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      interests: Array.isArray(parsed?.interests) ? parsed.interests : DEFAULT_PROFILE.interests,
    };
  } catch (error) {
    console.warn('Unable to read profile from storage, falling back to defaults.', error);
    return DEFAULT_PROFILE;
  }
};

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState(readProfileFromStorage);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    navigate('/home', { replace: true });
  }, [navigate]);

  const handleApply = useCallback(
    (opportunity) => {
      const applicant = profile.name || DEFAULT_PROFILE.name;
      window.alert(`Thanks, ${applicant}! We'll let ${opportunity.title} organizers know you're interested.`);
    },
    [profile.name],
  );

  const handleProfileSave = useCallback(
    (nextProfile) => {
      setProfile(nextProfile);
      window.alert('Profile saved!');
    },
    [],
  );

  const handleSignOut = useCallback(() => {
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <Login onComplete={handleLoginSuccess} />}
      />
      <Route element={<ProtectedLayout isAuthenticated={isAuthenticated} onSignOut={handleSignOut} />}>
        <Route path="/home" element={<HomePage />} />
        <Route
          path="/opportunities"
          element={<OpportunitiesPage profile={profile} onApply={handleApply} defaultProfile={DEFAULT_PROFILE} />}
        />
        <Route
          path="/profile"
          element={<ProfilePage profile={profile} onSave={handleProfileSave} defaultProfile={DEFAULT_PROFILE} />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function ProtectedLayout({ isAuthenticated, onSignOut }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">
      <Header onSignOut={onSignOut} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const navItems = [
  { route: 'home', label: 'Discover', path: '/home' },
  { route: 'opportunities', label: 'Opportunities', path: '/opportunities' },
  { route: 'profile', label: 'Profile', path: '/profile' },
];

function Header({ onSignOut }) {
  return (
    <header>
      <h1>Volunteer Cupid</h1>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.route}>
              <NavLink to={item.path} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <button type="button" className="sign-out" onClick={onSignOut}>
          Sign Out
        </button>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <p>© 2025 Volunteer Cupid</p>
    </footer>
  );
}

export default App;
