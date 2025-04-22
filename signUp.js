import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    sportsPosition: ''
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'Weak';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 'Strong';
    return 'Medium';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordStrength = getPasswordStrength(formData.password);

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength === 'Weak') {
      newErrors.password = 'Password is too weak - include uppercase and numbers';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.sportsPosition) {
      newErrors.sportsPosition = 'Please select your preferred position';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Account created! Redirecting to your locker room...');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setErrors({ api: data.message || 'Failed to create account' });
      }
    } catch (error) {
      setErrors({ api: 'Failed to connect to the server' });
    }
  };

  return (
    <div className="min-h-screen bg-stadium-pattern bg-cover py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
          Create Your Player Profile
        </h2>
        
        {errors.api && (
          <div className="mb-4 p-3 bg-red-800 text-red-100 rounded-md">
            {errors.api}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-800 text-green-100 rounded-md">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Player Name
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Team Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Playbook Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <div className="mt-1 text-sm">
              Strength: <span className={`font-bold ${
                getPasswordStrength(formData.password) === 'Strong' ? 'text-green-400' :
                getPasswordStrength(formData.password) === 'Medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {getPasswordStrength(formData.password)}
              </span>
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Confirm Playbook Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Preferred Position
            </label>
            <select
              name="sportsPosition"
              value={formData.sportsPosition}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="">Select your position</option>
              <option value="Quarterback">Quarterback</option>
              <option value="Striker">Striker</option>
              <option value="Point Guard">Point Guard</option>
              <option value="Pitcher">Pitcher</option>
              <option value="Captain">Captain</option>
            </select>
            {errors.sportsPosition && <p className="text-red-400 text-sm mt-1">{errors.sportsPosition}</p>}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Player Profile
          </button>

          <p className="mt-4 text-center text-sm text-gray-400">
            By signing up, you agree to our<br />
            <a href="/terms" className="text-blue-400 hover:text-blue-300">
              Code of Conduct & Player Agreement
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
