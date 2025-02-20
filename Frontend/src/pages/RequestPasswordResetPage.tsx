import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';

interface ResetRequestData {
  email: string;
  password_reminder: string;
}

const schema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Must be a valid email"),
  password_reminder: yup
    .string()
    .required("Password reminder is required")
    .min(5, "Must be at least 5 characters")
    .max(255, "Maximum 255 characters"),
});

const RequestPasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetRequestData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: ResetRequestData) => {
    try {
      const payload = {
        email: data.email.trim().toLowerCase(),
        password_reminder: data.password_reminder.trim(),
      };
      const response = await api.post('/auth/request-password-reset', payload);
      toast.success("Reset token received. Redirecting to reset page...");
      navigate(`/reset-password?token=${response.data.reset_token}`);
    } catch (error) {
      console.error('Error requesting password reset:', error.response?.data || error);
      toast.error("Error: Please check your details and try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Password Reset Request</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
            Enter the same reminder phrase you used during registration.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {isSubmitting ? 'Sending...' : 'Request Reset'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-blue-600 hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
};

export default RequestPasswordResetPage;
