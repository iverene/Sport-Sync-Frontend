import { useState } from 'react';
import { Shield, Save } from 'lucide-react';

export default function Security() {
    const [sessionTimeout, setSessionTimeout] = useState('30');
    const [maxLoginAttempts, setMaxLoginAttempts] = useState('3');
    const [passwordPolicy, setPasswordPolicy] = useState('medium');
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);

    const handleSave = () => {
        // Save security settings
        alert('Security settings saved successfully!');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Shield className="w-5 h-5" />
                        <h2 className="text-xl font-semibold">Security Settings</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Session Timeout */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Session Timeout (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={sessionTimeout}
                                    onChange={(e) => setSessionTimeout(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Login Attempts
                                </label>
                                <input
                                    type="number"
                                    value={maxLoginAttempts}
                                    onChange={(e) => setMaxLoginAttempts(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="mt-6 w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <Save className="w-4 h-4" />
                        Save Security Settings
                    </button>
                </div>
            </div>
        </div>
    );
}