import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';

interface ResetPasswordData {
  new_password: string;
  confirm_password: string;
}

const schema = yup.object().shape({
  new_password: yup
    .string()
    .required("New password is required")
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
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password"), null], "Passwords must match")
    .required("Please confirm your password"),
});

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  // Estado para mostrar/ocultar las contraseñas
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      await api.post('/auth/reset-password', { token, new_password: data.new_password });
      toast.success("Password has been reset successfully. Please log in.");
      navigate('/login');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error("Error resetting password. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4 relative">
          <label className="block text-gray-700">New Password</label>
          <input
            type={showNewPassword ? "text" : "password"}
            {...register('new_password')}
            className="w-full p-2 border rounded pr-12"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600"
          >
            {showNewPassword ? "Hide" : "Show"}
          </button>
          {errors.new_password && (
            <p className="text-red-500 text-sm">{errors.new_password.message}</p>
          )}
          <ul className="mt-2 text-xs text-gray-600">
            <li>- At least 8 characters.</li>
            <li>- Must contain at least one uppercase letter.</li>
            <li>- Must contain at least one lowercase letter.</li>
            <li>- Must contain at least one number.</li>
            <li>- No consecutive digits allowed.</li>
          </ul>
        </div>
        <div className="mb-4 relative">
          <label className="block text-gray-700">Confirm Password</label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register('confirm_password')}
            className="w-full p-2 border rounded pr-12"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600"
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
          {errors.confirm_password && (
            <p className="text-red-500 text-sm">{errors.confirm_password.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

export default ResetPasswordPage;
