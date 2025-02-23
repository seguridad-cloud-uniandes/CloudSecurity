import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  password_reminder: string;
}

const schema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
    .matches(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed")
    .min(3, "Minimum 3 characters")
    .max(50, "Maximum 50 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Must be a valid email"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .test(
      "no-consecutive-digits",
      "Password must not contain consecutive digits",
      (value) => {
        if (!value) return false;
        for (let i = 0; i < value.length - 1; i++) {
          if (/\d/.test(value[i]) && /\d/.test(value[i + 1])) {
            return false;
          }
        }
        return true;
      }
    ),
  password_reminder: yup
    .string()
    .required("Password reminder is required")
    .min(5, "Password reminder must be at least 5 characters")
    .max(255, "Password reminder cannot exceed 255 characters"),
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await api.post('/users/users', data);
      alert('Registration successful, please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Error registering user. Please check your data and try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">User Registration</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input
            type="text"
            {...register('username')}
            className="w-full p-2 border rounded"
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full p-2 border rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div className="mb-4 relative">
          <label className="block text-gray-700">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            {...register('password')}
            className="w-full p-2 border rounded pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
          <ul className="mt-2 text-xs text-gray-600">
            <li>- At least 8 characters.</li>
            <li>- Must contain at least one uppercase letter.</li>
            <li>- Must contain at least one lowercase letter.</li>
            <li>- Must contain at least one number.</li>
            <li>- No consecutive digits allowed.</li>
          </ul>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password Reminder</label>
          <input
            type="text"
            {...register('password_reminder')}
            className="w-full p-2 border rounded"
          />
          {errors.password_reminder && (
            <p className="text-red-500 text-sm">{errors.password_reminder.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-600">
            This reminder will be used to recover your password.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Log In here
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
