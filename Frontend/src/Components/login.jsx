import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BASE_URL from '../api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [otpData, setOtpData] = useState({
    otp: ''
  });
  const [loginType, setLoginType] = useState('user');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleOtpChange = (e) => {
    const { name, value } = e.target;
    setOtpData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = loginType === 'user' ? `${BASE_URL}/user/login` : `${BASE_URL}/admin/login`;
      const response = await axios.post(endpoint, formData);

      if (loginType === 'admin') {
        if (response.data.success) {
          if (!response.data.token) {
            alert("Authentication failed: No token received");
            return;
          }

          // Store token and user type
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userType', 'admin');
          alert(response.data.message);
          navigateTo('/dashboard');
        }
      } else if (loginType === 'user') {
        if (response.data.success) {
          // If OTP is required
          if (response.data.requiresOtp) {
            setUserEmail(formData.email);
            // setShowOtpVerification(true);
            alert("OTP sent to your email. Please verify.");
            return;
          }

          if (!response.data.token) {
            alert("Authentication failed: No token received");
            return;
          }

          alert(response.data.message);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userType', 'user');
          navigateTo('/taskMangement');
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Login failed");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/user/verify-otp`, {
        email: userEmail,
        otp: otpData.otp
      });

      if (response.data.success) {
        alert(response.data.message);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'user');
        navigateTo('/taskMangement');
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || "OTP verification failed");
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/resend-otp`, {
        email: userEmail
      });

      if (response.data.success) {
        alert("OTP has been resent to your email");
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 md:p-12 flex-col justify-center items-center text-white relative">
          <div className="absolute inset-0 bg-black opacity-10 z-0"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-bold mb-4">Task Manager Pro</h1>
            <p className="text-lg text-indigo-100 mb-8">
              Organize your work, life, and everything in between.
            </p>
            <svg className="w-32 h-32 mx-auto text-indigo-200 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8">
          <div className="max-w-md w-full space-y-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to access your dashboard.
              </p>
            </div>

            {!showOtpVerification ? (
              <>
                <div className="flex rounded-md overflow-hidden border border-gray-300">
                  <button
                    type="button"
                    onClick={() => setLoginType('user')}
                    className={`flex-1 py-2 px-4 text-sm font-medium ${loginType === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    User Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginType('admin')}
                    className={`flex-1 py-2 px-4 text-sm font-medium ${loginType === 'admin'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Admin Login
                  </button>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 justify-between">
                        <span>Password</span>
                        <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">
                          Forgot password?
                        </a>
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember_me"
                          name="remember_me"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition duration-150 ease-in-out"
                        />
                        <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                          Remember me
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:-translate-y-0.5"
                    >
                      {loginType === 'user' ? 'Sign in as User' : 'Sign in as Admin'}
                    </button>
                  </div>
                </form>

                {/* Only show these options for user login */}
                {loginType === 'user' && (
                  <>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-2 bg-white text-sm text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-150 ease-in-out">
                        <span className="sr-only">Sign in with Google</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" /></svg>
                      </button>
                      <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-150 ease-in-out">
                        <span className="sr-only">Sign in with Facebook</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" /></svg>
                      </button>
                      <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-150 ease-in-out">
                        <span className="sr-only">Sign in with Twitter</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" /></svg>
                      </button>
                    </div>

                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">
                          Sign up
                        </Link>
                      </p>
                    </div>
                  </>
                )}
              </>
            ) : (
              // OTP Verification Form
              <div className="mt-6">
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                      Enter OTP
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm"
                      placeholder="Enter the OTP sent to your email"
                      value={otpData.otp}
                      onChange={handleOtpChange}
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:-translate-y-0.5"
                    >
                      Verify OTP
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setShowOtpVerification(false)}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      Back to Login
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;