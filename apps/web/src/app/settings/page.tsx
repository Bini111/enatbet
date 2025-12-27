'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  Home, 
  Bell, 
  Globe, 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  Shield as ShieldIcon,
  ChevronRight,
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const { user, signOutUser } = useAuthStore();
  const router = useRouter();
  
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  const handleSignOut = async () => {
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    await signOutUser();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to access settings</p>
          <Link href="/login" className="bg-pink-600 text-white px-6 py-2 rounded-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* User Profile Card */}
        <Link href="/profile" className="block bg-white rounded-xl p-4 mb-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                {getInitials(user.displayName || 'User')}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{user.displayName || 'User'}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <p className="text-indigo-500 text-sm">Guest Account</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>

        {/* Account Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Account</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <SettingsItem 
              icon={<User className="w-5 h-5" />}
              title="Personal Information"
              subtitle="Name, phone, emergency contact"
              href="/profile"
            />
            <SettingsItem 
              icon={<CreditCard className="w-5 h-5" />}
              title="Payment Methods"
              subtitle="Manage your saved cards"
              href="/settings/payments"
            />
            <SettingsItem 
              icon={<ShieldCheck className="w-5 h-5" />}
              title="Verification"
              subtitle="Get verified for $5"
              href="/settings/verification"
              badge="NEW"
            />
            <SettingsItem 
              icon={<Lock className="w-5 h-5" />}
              title="Login & Security"
              subtitle="Password, connected accounts"
              href="/settings/security"
              isLast
            />
          </div>
        </div>

        {/* Hosting Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Hosting</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <SettingsItem 
              icon={<Home className="w-5 h-5" />}
              title="Become a Host"
              subtitle="Start earning with your property"
              href="/become-a-host"
              isLast
            />
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Preferences</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <SettingsItem 
              icon={<Bell className="w-5 h-5" />}
              title="Notifications"
              subtitle="Push, email, SMS preferences"
              href="/settings/notifications"
            />
            <SettingsItem 
              icon={<Globe className="w-5 h-5" />}
              title="Language & Currency"
              subtitle="English, USD"
              href="/settings/language"
              isLast
            />
          </div>
        </div>

        {/* Support Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Support</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <SettingsItem 
              icon={<HelpCircle className="w-5 h-5" />}
              title="Help Center"
              href="/help"
            />
            <SettingsItem 
              icon={<MessageSquare className="w-5 h-5" />}
              title="Contact Us"
              href="/contact"
            />
            <SettingsItem 
              icon={<FileText className="w-5 h-5" />}
              title="Terms of Service"
              href="/terms-of-service"
            />
            <SettingsItem 
              icon={<ShieldIcon className="w-5 h-5" />}
              title="Privacy Policy"
              href="/privacy-policy"
              isLast
            />
          </div>
        </div>

        {/* Admin Section - Only for admins */}
        {isAdmin && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Admin</h3>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <SettingsItem 
                icon={<ShieldIcon className="w-5 h-5 text-pink-600" />}
                title="Admin Panel"
                subtitle="Manage platform"
                href="/admin"
                isLast
                highlight
              />
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 transition-colors mb-6"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>

        {/* Version */}
        <p className="text-center text-gray-400 text-sm">Enatbet v1.0.0</p>
      </div>
    </div>
  );
}

function SettingsItem({ 
  icon, 
  title, 
  subtitle, 
  href, 
  badge, 
  isLast = false,
  highlight = false
}: { 
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  href: string;
  badge?: string;
  isLast?: boolean;
  highlight?: boolean;
}) {
  return (
    <Link 
      href={href}
      className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${highlight ? 'bg-pink-100 text-pink-600' : 'bg-indigo-50 text-indigo-500'}`}>
          {icon}
        </div>
        <div>
          <p className={`font-medium ${highlight ? 'text-pink-600' : 'text-gray-900'}`}>{title}</p>
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {badge}
          </span>
        )}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </Link>
  );
}
