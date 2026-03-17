import { Bell, User, LogOut, Sun, Moon } from 'lucide-react';
import { UserProfile } from '../types';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useTheme } from './ThemeProvider';

interface NavbarProps {
  profile: UserProfile | null;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ profile, setActiveTab }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-20 bg-[var(--bg-main)] flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex flex-col">
        <h1 className="text-xl font-black text-[var(--text-main)] tracking-tighter leading-none">SINDPETSHOP</h1>
        <p className="text-[10px] text-[var(--text-main)] opacity-40 font-bold uppercase tracking-widest mt-1">SINDICATO SP</p>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[var(--text-main)] opacity-60 hover:bg-white/10 transition-all active:scale-95"
          title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
        </button>

        <button 
          onClick={() => setActiveTab('notifications')}
          className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[var(--text-main)] hover:bg-white/10 transition-colors relative"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-dark-bg"></span>
        </button>
        
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('profile')}
            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20 cursor-pointer hover:scale-110 active:scale-95 transition-all"
          >
            {profile?.name?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="p-2 text-[var(--text-main)] opacity-20 hover:text-red-500 transition-colors md:hidden"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
