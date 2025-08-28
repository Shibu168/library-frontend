import React, { useState } from 'react';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    libraryName: 'City Central Library',
    libraryEmail: 'admin@citylibrary.com',
    libraryPhone: '+1 (555) 123-4567',
    libraryAddress: '123 Library Lane, Bookville, CA 94305',
    maxBorrowLimit: 5,
    borrowingPeriod: 14,
    
    // Loan Policies
    gracePeriod: 3,
    dailyFine: 0.50,
    maxFine: 10.00,
    reservationHoldTime: 48,
    
    // Notifications
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    dueDateReminder: true,
    advanceNoticeDays: 2,
    
    // Appearance
    theme: 'light',
    primaryColor: '#4361ee',
    secondaryColor: '#3a0ca3',
    enableAnimations: true,
    
    // Security
    requireStrongPasswords: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    enable2FA: false,
    
    // Backup
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retainBackups: 30,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    // In a real app, this would send the settings to your backend
    console.log('Saving settings:', settings);
    // Show success message
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to default settings
      setSettings({
        libraryName: 'City Central Library',
        libraryEmail: 'admin@citylibrary.com',
        libraryPhone: '+1 (555) 123-4567',
        libraryAddress: '123 Library Lane, Bookville, CA 94305',
        maxBorrowLimit: 5,
        borrowingPeriod: 14,
        gracePeriod: 3,
        dailyFine: 0.50,
        maxFine: 10.00,
        reservationHoldTime: 48,
        enableEmailNotifications: true,
        enableSMSNotifications: false,
        dueDateReminder: true,
        advanceNoticeDays: 2,
        theme: 'light',
        primaryColor: '#4361ee',
        secondaryColor: '#3a0ca3',
        enableAnimations: true,
        requireStrongPasswords: true,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
        enable2FA: false,
        autoBackup: true,
        backupFrequency: 'daily',
        backupTime: '02:00',
        retainBackups: 30,
      });
      alert('Settings have been reset to default values.');
    }
  };

  const SettingSection = ({ title, children, icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <i className={`${icon} mr-2 text-blue-500`}></i>
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ label, description, children }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="md:w-2/3 mb-2 md:mb-0">
        <label className="font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <div className="md:w-1/3">
        {children}
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-3 rounded-lg flex items-center transition-all duration-300 ${
        activeTab === id 
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 shadow-inner' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <i className={`${icon} mr-2`}></i>
      {label}
    </button>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">System Settings</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 flex items-center"
          >
            <i className="fas fa-save mr-2"></i>
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sticky top-6">
            <div className="space-y-2">
              <TabButton id="general" label="General" icon="fas fa-cog" />
              <TabButton id="loans" label="Loan Policies" icon="fas fa-exchange-alt" />
              <TabButton id="notifications" label="Notifications" icon="fas fa-bell" />
              <TabButton id="appearance" label="Appearance" icon="fas fa-paint-brush" />
              <TabButton id="security" label="Security" icon="fas fa-shield-alt" />
              <TabButton id="backup" label="Backup" icon="fas fa-database" />
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:w-3/4">
          {activeTab === 'general' && (
            <div>
              <SettingSection title="General Settings" icon="fas fa-cog">
                <SettingRow 
                  label="Library Name" 
                  description="The name of your library as it appears throughout the system"
                >
                  <input
                    type="text"
                    name="libraryName"
                    value={settings.libraryName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Library Email" 
                  description="Primary contact email for the library"
                >
                  <input
                    type="email"
                    name="libraryEmail"
                    value={settings.libraryEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Library Phone" 
                  description="Primary contact phone number"
                >
                  <input
                    type="text"
                    name="libraryPhone"
                    value={settings.libraryPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Library Address" 
                  description="Physical address of the library"
                >
                  <textarea
                    name="libraryAddress"
                    value={settings.libraryAddress}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Maximum Borrow Limit" 
                  description="Maximum number of books a member can borrow at once"
                >
                  <input
                    type="number"
                    name="maxBorrowLimit"
                    value={settings.maxBorrowLimit}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Borrowing Period (days)" 
                  description="Default number of days a book can be borrowed"
                >
                  <input
                    type="number"
                    name="borrowingPeriod"
                    value={settings.borrowingPeriod}
                    onChange={handleInputChange}
                    min="1"
                    max="90"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
              </SettingSection>
            </div>
          )}

          {activeTab === 'loans' && (
            <div>
              <SettingSection title="Loan Policies" icon="fas fa-exchange-alt">
                <SettingRow 
                  label="Grace Period (days)" 
                  description="Number of days after due date before fines are applied"
                >
                  <input
                    type="number"
                    name="gracePeriod"
                    value={settings.gracePeriod}
                    onChange={handleInputChange}
                    min="0"
                    max="7"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Daily Fine Amount ($)" 
                  description="Fine charged per day for overdue books"
                >
                  <input
                    type="number"
                    name="dailyFine"
                    value={settings.dailyFine}
                    onChange={handleInputChange}
                    min="0"
                    step="0.05"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Maximum Fine ($)" 
                  description="Maximum fine amount per book"
                >
                  <input
                    type="number"
                    name="maxFine"
                    value={settings.maxFine}
                    onChange={handleInputChange}
                    min="0"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Reservation Hold Time (hours)" 
                  description="How long to hold a reserved book for a member"
                >
                  <input
                    type="number"
                    name="reservationHoldTime"
                    value={settings.reservationHoldTime}
                    onChange={handleInputChange}
                    min="1"
                    max="168"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
              </SettingSection>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <SettingSection title="Notification Settings" icon="fas fa-bell">
                <SettingRow 
                  label="Enable Email Notifications" 
                  description="Send notifications via email to members"
                >
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableEmailNotifications"
                      checked={settings.enableEmailNotifications}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </SettingRow>
                
                <SettingRow 
                  label="Enable SMS Notifications" 
                  description="Send notifications via SMS to members"
                >
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableSMSNotifications"
                      checked={settings.enableSMSNotifications}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </SettingRow>
                
                <SettingRow 
                  label="Due Date Reminders" 
                  description="Send reminders before books are due"
                >
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="dueDateReminder"
                      checked={settings.dueDateReminder}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </SettingRow>
                
                <SettingRow 
                  label="Advance Notice (days)" 
                  description="How many days in advance to send due date reminders"
                >
                  <input
                    type="number"
                    name="advanceNoticeDays"
                    value={settings.advanceNoticeDays}
                    onChange={handleInputChange}
                    min="0"
                    max="7"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
              </SettingSection>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <SettingSection title="Appearance Settings" icon="fas fa-paint-brush">
                <SettingRow 
                  label="Theme" 
                  description="Choose between light and dark theme"
                >
                  <select
                    name="theme"
                    value={settings.theme}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System Preference)</option>
                  </select>
                </SettingRow>
                
                <SettingRow 
                  label="Primary Color" 
                  description="Main color used throughout the application"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-md mr-2 border border-gray-300"
                      style={{ backgroundColor: settings.primaryColor }}
                    ></div>
                    <input
                      type="text"
                      name="primaryColor"
                      value={settings.primaryColor}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                </SettingRow>
                
                <SettingRow 
                  label="Secondary Color" 
                  description="Secondary color used throughout the application"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-md mr-2 border border-gray-300"
                      style={{ backgroundColor: settings.secondaryColor }}
                    ></div>
                    <input
                      type="text"
                      name="secondaryColor"
                      value={settings.secondaryColor}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                </SettingRow>
                
                <SettingRow 
                  label="Enable Animations" 
                  description="Enable subtle animations throughout the interface"
                >
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableAnimations"
                      checked={settings.enableAnimations}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </SettingRow>
              </SettingSection>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <SettingSection title="Security Settings" icon="fas fa-shield-alt">
                <SettingRow 
                  label="Require Strong Passwords" 
                  description="Enforce strong password requirements for all users"
                >
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="requireStrongPasswords"
                      checked={settings.requireStrongPasswords}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </SettingRow>
                
                <SettingRow 
                  label="Session Timeout (minutes)" 
                  description="Time of inactivity before automatic logout"
                >
                  <input
                    type="number"
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={handleInputChange}
                    min="1"
                    max="240"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Maximum Login Attempts" 
                  description="Number of failed login attempts before account is locked"
                >
                  <input
                    type="number"
                    name="maxLoginAttempts"
                    value={settings.maxLoginAttempts}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Enable Two-Factor Authentication" 
                  description="Require 2FA for admin accounts"
                >
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enable2FA"
                      checked={settings.enable2FA}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </SettingRow>
              </SettingSection>
            </div>
          )}

          {activeTab === 'backup' && (
            <div>
              <SettingSection title="Backup Settings" icon="fas fa-database">
                <SettingRow 
                  label="Automatic Backups" 
                  description="Enable automatic database backups"
                >
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoBackup"
                      checked={settings.autoBackup}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </SettingRow>
                
                <SettingRow 
                  label="Backup Frequency" 
                  description="How often to perform automatic backups"
                >
                  <select
                    name="backupFrequency"
                    value={settings.backupFrequency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </SettingRow>
                
                <SettingRow 
                  label="Backup Time" 
                  description="Time of day to perform backups (24-hour format)"
                >
                  <input
                    type="time"
                    name="backupTime"
                    value={settings.backupTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Retain Backups (days)" 
                  description="Number of days to keep backup files before deletion"
                >
                  <input
                    type="number"
                    name="retainBackups"
                    value={settings.retainBackups}
                    onChange={handleInputChange}
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </SettingRow>
                
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300 flex items-center">
                    <i className="fas fa-download mr-2"></i>
                    Download Current Backup
                  </button>
                </div>
              </SettingSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;