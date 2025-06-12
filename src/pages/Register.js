import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import croppedImage from '../assets/poster.png';
import {
  getDocs,
  collection,
  where,
  query,
  setDoc,
  doc,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const usernameQuery = query(
        collection(db, 'users'),
        where('username', '==', form.username)
      );
      const usernameSnapshot = await getDocs(usernameQuery);
      if (!usernameSnapshot.empty) {
        alert('Username sudah digunakan. Silakan pilih username lain.');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      try {
        await setDoc(doc(db, 'users', user.uid), {
          username: form.username,
          email: form.email,
          totalScore: 0,
          emailVerified: false,
        });

        localStorage.setItem(
          'userProfile',
          JSON.stringify({ username: form.username, email: form.email, totalScore: 0, emailVerified: false })
        );

        alert('Registrasi berhasil! Silakan cek email Anda untuk verifikasi dan kemudian login.');
        setForm({ username: '', email: '', password: '' });
        navigate('/login');
      } catch (firestoreError) {
        console.error('Error saat menyimpan data profil user ke Firestore:', firestoreError);
        await user.delete();
        alert('Registrasi gagal. Terjadi masalah saat menyimpan data profil.');
      }
    } catch (authError) {
      console.error('Error saat registrasi Firebase Auth:', authError);
      if (authError.code === 'auth/email-already-in-use') {
        alert('Email sudah terdaftar. Silakan gunakan email lain atau login.');
      } else if (authError.code === 'auth/invalid-email') {
        alert('Format email tidak valid.');
      } else if (authError.code === 'auth/weak-password') {
        alert('Password terlalu lemah. Gunakan minimal 6 karakter.');
      } else {
        alert('Terjadi kesalahan saat registrasi. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundImage: `url(${croppedImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'rgb(255, 78, 24)',
          padding: '40px 35px',
          borderRadius: '12px',
          boxShadow: '0 8px 16px rgb(253, 237, 3)',
          display: 'flex',
          flexDirection: 'column',
          width: 320,
          color: '#ffffff',
        }}
      >
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>
          Create Account
        </h2>

        {['username', 'email', 'password'].map((field) => (
          <label
            key={field}
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '20px',
              fontWeight: '600',
              fontSize: '14px',
              letterSpacing: '0.5px',
              textTransform: 'capitalize',
            }}
          >
            {field === 'password'
              ? 'Password'
              : field.charAt(0).toUpperCase() + field.slice(1)}
            <input
              type={
                field === 'password'
                  ? 'password'
                  : field === 'email'
                  ? 'email'
                  : 'text'
              }
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
              style={{
                marginTop: '8px',
                padding: '12px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </label>
        ))}

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? '#6c757d' : '#2978f0',
            padding: '14px 0',
            borderRadius: '10px',
            border: 'none',
            fontWeight: '700',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#fff',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (loading ? null : (e.currentTarget.style.backgroundColor = '#1a5edb'))}
          onMouseLeave={(e) => (loading ? null : (e.currentTarget.style.backgroundColor = '#2978f0'))}
        >
          {loading ? 'Mendaftar...' : 'Register'}
        </button>

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: '#FFD700', textDecoration: 'underline' }}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;