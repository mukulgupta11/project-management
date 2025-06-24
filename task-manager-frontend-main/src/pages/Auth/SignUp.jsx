import React, { useContext, useState } from 'react'
import AuthLayout from './../../components/layouts/AuthLayout'
import { validateUsername } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/Input';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import uploadImage from '../../utils/uploadImage';

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState("");
   const [ADMIN_SIGNUP_CODE, setADMIN_SIGNUP_CODE] = useState('');
  const [MEMBER_SIGNUP_CODE, setMEMBER_SIGNUP_CODE] = useState('');
  const [activeTab, setActiveTab] = useState('member');
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const {updatedUser} = useContext(UserContext);

  const handleSignUp = async(e) => {
    e.preventDefault();

    let profileImageUrl = ''

    if(!fullName) {
      setError("Please enter full name")
    }

     if (!validateUsername(username)) {
      setError('Please enter a valid username.');
      return;
    }

    if(!password) {
      setError("Please enter the password");
      return;
    }
    if (activeTab === 'admin' && !ADMIN_SIGNUP_CODE) {
      setError('Please enter the admin signup code.');
      return;
    }
    if (activeTab === 'member' && !MEMBER_SIGNUP_CODE) {
      setError('Please enter the member signup code.');
      return;
    }

    const signupCode = activeTab === "admin" ? ADMIN_SIGNUP_CODE : MEMBER_SIGNUP_CODE;

  if (!signupCode) {
    setError("Please enter the signup code.");
    return;
  }

    setError("");

    // SignUp API
    try {
      // upload image if presents
      if (profilePic) {
        const imageUploadRes = await uploadImage(profilePic);
        profileImageUrl = imageUploadRes.imageUrl || "";
      }
      

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        username,
        password,
        profileImageUrl,
        signupCode,
        role: activeTab,
      });

      const {token, role} = response.data;

      if(token) {
        localStorage.setItem("token", token);
        updatedUser(response.data);
      }

      // Redirect based on role
      if(role === "admin") navigate("/admin/dashboard");
      else navigate("/user/dashboard");

    } catch (error) {
      if(error.message && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something wrong. Please try again.");
      }
    }

  }

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Create an Account</h3>

        <div className="flex space-x-4 my-4">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'admin'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('admin')}
          >
            Admin
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'member'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('member')}
          >
            Member
          </button>
        </div>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="John"
              type="text"
            />
            <Input
              value={username}
              onChange={({ target }) => setUsername(target.value)}
              label="Username"
              placeholder="rock"
              type="text"
            />
            <Input
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Password"
              placeholder="min 8 characters"
              type="password"
            />
            {activeTab === 'admin' && (
              <Input
                value={ADMIN_SIGNUP_CODE}
                onChange={({ target }) => setADMIN_SIGNUP_CODE(target.value)}
                label="ADMIN SIGNUP CODE"
                placeholder="Enter code"
                type="text"
              />
            )}
            {activeTab === 'member' && (
              <Input
                value={MEMBER_SIGNUP_CODE}
                onChange={({ target }) => setMEMBER_SIGNUP_CODE(target.value)}
                label="MEMBER SIGNUP CODE"
                placeholder="Enter code"
                type="text"
              />
            )}
          </div>

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary mt-4">
            Sign Up
          </button>
        </form>

        <p className="text-[13px] text-slate-800 mt-3">
          Already have an account?{' '}
          <Link className="font-medium text-primary underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default SignUp
